const fs = require('fs');
const path = require('path');
const JSONStream = require('JSONStream');
const PDFDocument = require('pdfkit');

// Chemin vers le dossier contenant les fichiers de mots ou phrases problématiques
const infractionsDir = path.join(__dirname, 'infractions');

// Chemin du fichier JSON contenant les messages Discord
const discordJsonFilePath = path.join(__dirname, 'data', 'discord_messages.json');

// Liste pour stocker les mots ou phrases problématiques
let problematicPatterns = [];

// Fonction pour charger les motifs problématiques à partir des fichiers texte dans le dossier infractions
async function loadProblematicPatterns() {
    try {
        const files = await fs.promises.readdir(infractionsDir); // Lire tous les fichiers dans le dossier 'infractions'

        for (const file of files) {
            const filePath = path.join(infractionsDir, file);

            // Vérifier que le fichier est un fichier texte
            if (path.extname(file) === '.txt') {
                const fileContent = await fs.promises.readFile(filePath, 'utf8');

                // Ajouter les motifs du fichier à la liste
                const patterns = fileContent.split('\n').map(pattern => pattern.trim()).filter(Boolean);
                problematicPatterns = [...problematicPatterns, ...patterns];
            }
        }

        console.log(`Motifs problématiques chargés (incluant les émoticônes) : ${problematicPatterns.length}`);
    } catch (err) {
        console.error('Erreur lors du chargement des motifs problématiques :', err);
    }
}

// Fonction pour convertir les émoticônes en représentation hexadécimale
function convertEmojisToHex(content) {
    return content.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2764}\u{1F004}-\u{1F0CF}]/gu, (match) => {
        return '\\x' + match.codePointAt(0).toString(16).toUpperCase();
    });
}

// Fonction pour créer un rapport PDF des messages problématiques
function createPDFReport(messages, outputFilePath) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            const pdfPath = outputFilePath.replace('.json', '.pdf');
            const writeStream = fs.createWriteStream(pdfPath);

            doc.pipe(writeStream);

            // Titre du rapport
            doc.fontSize(20).text('Rapport de Violations - Discord', { align: 'center' });
            doc.moveDown();

            // Résumé
            doc.fontSize(12).text(`Ce rapport contient ${messages.length} message(s) problématique(s) détecté(s) sur Discord`);
            doc.moveDown();

            // Messages détaillés
            messages.forEach((msg, index) => {
                const messageWithHexEmotes = convertEmojisToHex(msg.content);
                doc
                    .fontSize(10)
                    .text(`Message ${index + 1}:`, { underline: true })
                    .text(`- ID : ${msg.id}`)
                    .text(`- Contenu : ${messageWithHexEmotes}`)
                    .text(`- Date et Heure : ${msg.timestamp}`)
                    .moveDown();
            });

            // Fin du document
            doc.end();

            writeStream.on('finish', () => {
                console.log(`Rapport PDF généré : ${pdfPath}`);
                resolve();
            });

            writeStream.on('error', (err) => reject(err));
        } catch (err) {
            reject(err);
        }
    });
}

// Fonction pour analyser les messages Discord
async function analyzeMessages() {
    const outputFilePath = path.join(__dirname, 'reports', 'problematic_messages_report.json');

    try {
        // Vérifie si le fichier JSON existe
        await fs.promises.access(discordJsonFilePath);
        await fs.promises.mkdir(path.dirname(outputFilePath), { recursive: true });

        // Charge les motifs problématiques
        await loadProblematicPatterns();

        const fileStream = fs.createReadStream(discordJsonFilePath);
        const jsonStream = JSONStream.parse('*'); // Lire tout le fichier JSON
        const problematicMessages = [];

        fileStream
            .pipe(jsonStream)
            .on('data', (message) => {
                // Vérifie si le message contient un motif problématique
                if (problematicPatterns.some(pattern => message.content.includes(pattern))) {
                    problematicMessages.push({
                        id: message.id,
                        content: message.content,
                        timestamp: message.timestamp
                    });
                }
            })
            .on('end', async () => {
                // Sauvegarde les messages problématiques dans un fichier JSON
                if (problematicMessages.length > 0) {
                    await fs.promises.writeFile(outputFilePath, JSON.stringify(problematicMessages, null, 2), 'utf8');
                    console.log(`Rapport JSON généré avec ${problematicMessages.length} messages problématiques.`);

                    // Génération du rapport PDF
                    await createPDFReport(problematicMessages, outputFilePath);
                } else {
                    console.log('Aucun message problématique détecté.');
                }
            })
            .on('error', (err) => console.error('Erreur lors de l\'analyse des messages :', err));
    } catch (err) {
        console.error('Erreur :', err.message);
    }
}

// Exécution de la fonction
analyzeMessages();