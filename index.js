const fs = require('fs');
const path = require('path');
const JSONStream = require('JSONStream');

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

        console.log(`Motifs problématiques chargés : ${problematicPatterns.length}`);
    } catch (err) {
        console.error('Erreur lors du chargement des motifs problématiques :', err);
    }
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
                    console.log(`Rapport généré avec ${problematicMessages.length} messages problématiques.`);
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