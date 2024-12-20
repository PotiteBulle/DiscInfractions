# DiscInfractions
Système automatisé conçu pour surveiller et détecter les infractions dans les messages Discord. Il identifie les messages problématiques et génère un rapport des violations pour faciliter la modération.

## Fonctionnalités
- Chargement des mots offensants à partir des fichiers texte dans le dossier `infractions`.
- Extraction des messages Discord contenant ces mots.
- Génération d'un rapport au format JSON listant les messages violant les règles.

## Prérequis
- Node.js installé sur votre machine.
- Fichiers de messages Discord en format JSON.

## Installation
- Clonez ou téléchargez ce repository.
- Ouvrez un terminal et naviguez jusqu'au dossier du projet.
- Exécutez la commande suivante pour installer les dépendances :
   ```bash
   npm install
   ```

## Utilisation
- Placez vos fichiers de mots offensants dans le dossier `infractions/` (un mot par ligne dans chaque fichier texte).
- Placez votre fichier JSON contenant les messages Discord dans le dossier `data/` (nom du fichier : `discord_messages.json`).
- Exécutez le script avec la commande suivante :
   ```bash
   node index.js
   ```
- Le rapport sera généré dans le fichier `reports/infractions_report.json`.

## Contribution
Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## Utilisation
Une fois le projet démarré, vous pouvez interagir avec l'outil via la ligne de commande ou utiliser les points de terminaison API fournis pour l'intégration dans d'autres systèmes.


# Clause de non-responsabilité : Avertissement
Les outils et scripts présentés ici sont fournis à des fins éducatives et informatives. Leur utilisation se fait à vos propres risques. L’auteur·ice ne peut être tenu·e responsable de tout dommage, perte de données ou violation de sécurité résultant de leur utilisation. Veillez à tester ces outils dans un environnement sécurisé et à respecter les lois et réglementations en vigueur dans votre juridiction. L’utilisation non autorisée de ces outils peut contrevenir à la législation locale ou internationale.


## License
Ce projet est sous licence MIT. Consultez le fichier [LICENSE](https://github.com/PotiteBulle/DiscInfractions/blob/main/LICENSE) pour plus de détails.