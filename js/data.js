/*
 * Source unique du CV. L'accueil, le CV classique, le portfolio et les liens
 * « projet suivant » sont construits à partir de ce fichier : une modification
 * ici se répercute partout.
 *
 * Projets :
 *  - pour retirer un projet partout, passer `show` à false ;
 *  - pour en ajouter un, copier un bloc existant (l'ordre de la liste est l'ordre d'affichage) ;
 *  - un projet sans `question` n'a pas de tuile sur l'accueil ni le portfolio,
 *    mais apparaît dans le CV classique.
 *
 * Les textes sont du HTML et existent en français (fr) et en anglais (en).
 */
window.CV = {
  name: "Samet Bucak",
  email: "samet.bucak60@gmail.com",
  linkedin: "https://www.linkedin.com/in/samet-bucak/",
  github: "https://github.com/sametdu60",
  site: "sametdu60.github.io",
  photo: "assets/photos/img-profil.jpg",

  title: { fr: "Futur ingénieur cybersécurité", en: "Cybersecurity engineer to be" },
  tagline: {
    fr: "Je viens du réseau. Je vais vers la <em>détection</em>.",
    en: "I come from networking. I'm heading for <em>threat detection</em>."
  },
  pitch: {
    fr: "En dernière année d'école d'ingénieur à l'ESIEA, majeure cybersécurité, après cinq ans d'alternance en réseau, systèmes et automatisation. Reconverti depuis le terrain, j'intègre la sécurité dès la conception et je me spécialise dans la détection de menaces.",
    en: "Final-year engineering student at ESIEA, cybersecurity major, after five years of work-study in networks, systems and automation. Having switched careers from field work, I build security in from the design stage and I'm specialising in threat detection."
  },

  seeking: {
    summary: { fr: "Un premier poste en cybersécurité", en: "A first cybersecurity role" },
    roles: [
      { fr: "SOC", en: "SOC" },
      { fr: "Sécurité des infrastructures et du cloud", en: "Infrastructure and cloud security" },
      { fr: "Détection de menaces", en: "Threat detection" }
    ],
    contract: { fr: "CDI", en: "Permanent (CDI)" },
    start: { fr: "Septembre 2027", en: "September 2027" },
    location: { fr: "Paris", en: "Paris" },
    sentence: {
      fr: "Je cherche un premier poste en cybersécurité, en CDI à Paris, dès septembre 2027 : SOC, sécurité des infrastructures et du cloud, détection de menaces.",
      en: "I'm looking for a first cybersecurity role, permanent contract in Paris, from September 2027: SOC, infrastructure and cloud security, threat detection."
    }
  },

  facts: [
    { label: { fr: "Aujourd'hui", en: "Today" }, value: { fr: "Apprenti ingénieur", en: "Apprentice engineer" }, sub: { fr: "Orange Viaccess-Orca", en: "Orange Viaccess-Orca" } },
    { label: { fr: "Avant", en: "Before" }, value: { fr: "Technicien systèmes et réseaux", en: "Systems &amp; network technician" }, sub: { fr: "2 ans en DSI", en: "2 years in IT ops" } },
    { label: { fr: "Diplôme", en: "Degree" }, value: { fr: "Ingénieur cybersécurité", en: "Cybersecurity engineer" }, sub: { fr: "ESIEA, 2027", en: "ESIEA, 2027" } }
  ],

  experience: [
    {
      role: { fr: "Apprenti ingénieur automatisation QA &amp; intégration IA", en: "Apprentice engineer, QA automation &amp; AI integration" },
      org: { fr: "Orange Viaccess-Orca · La Défense", en: "Orange Viaccess-Orca · La Défense" },
      period: { fr: "Sept. 2025 – aujourd'hui", en: "Sept. 2025 – present" },
      bullets: [
        { fr: "Conception d'un outil qui migre en masse les tests d'intégration d'une application TV, de Detox vers Robot Framework.", en: "Designed a tool that migrates a TV app's integration tests at scale, from Detox to Robot Framework." },
        { fr: "Déploiement sur un modèle de langage hébergé en local, pour qu'aucune donnée ne quitte l'infrastructure.", en: "Deployed on a locally hosted language model, so no data leaves the infrastructure." },
        { fr: "Cartographie des contraintes et priorisation des déploiements avec la méthode PDCA.", en: "Mapped constraints and prioritised deployments with the PDCA method." }
      ]
    },
    {
      role: { fr: "Assistant chef de projet IT", en: "Assistant IT project manager" },
      org: { fr: "Orange Viaccess-Orca · Paris", en: "Orange Viaccess-Orca · Paris" },
      period: { fr: "2024 – 2025", en: "2024 – 2025" },
      bullets: [
        { fr: "Coordination des livrables entre les équipes de développement et d'infrastructure.", en: "Coordinated deliverables between development and infrastructure teams." },
        { fr: "Traduction des besoins métiers en spécifications techniques.", en: "Turned business needs into technical specifications." }
      ]
    },
    {
      role: { fr: "Technicien informatique, DSI (alternance)", en: "IT technician, IT department (work-study)" },
      org: { fr: "CFPTS · Bagnolet", en: "CFPTS · Bagnolet" },
      period: { fr: "2022 – 2024", en: "2022 – 2024" },
      bullets: [
        { fr: "Équipements actifs et routeurs MikroTik : filtrage, routage, segmentation.", en: "Active equipment and MikroTik routers: filtering, routing, segmentation." },
        { fr: "Parc informatique et support N1/N2.", en: "Endpoint fleet and L1/L2 support." },
        { fr: "Référent téléphonie IP, pilotage du prestataire.", en: "IP telephony lead, managing the provider." }
      ]
    },
    {
      role: { fr: "Avant l'informatique", en: "Before IT" },
      org: { fr: "Restauration, logistique (Amazon, Darty), agent de sûreté aéroportuaire à Roissy-CDG", en: "Restaurants, logistics (Amazon, Darty), airport security officer at Paris-CDG" },
      period: { fr: "2015 – 2021", en: "2015 – 2021" },
      bullets: []
    }
  ],

  projects: [
    {
      id: "detection",
      show: true,
      link: "projet-detection.html",
      tone: "dark",
      context: { fr: "Détection de menaces", en: "Threat detection" },
      status: { fr: "En cours", en: "Ongoing" },
      period: "2026 – 2027",
      title: { fr: "Détection comportementale de menaces réseau", en: "Behaviour-based network threat detection" },
      question: { fr: "Comment repérer un attaquant qui ne déclenche aucune alarme ?", en: "How do you catch an attacker who triggers no alarm?" },
      summary: {
        fr: "Lab d'entreprise segmenté, capteur Rust qui calcule les empreintes JA4+ du trafic, leurres internes et score de risque explicable.",
        en: "Segmented company lab, Rust sensor computing JA4+ traffic fingerprints, internal decoys and an explainable risk score."
      },
      tags: ["Rust", "Python", "JA4+", "Deception"]
    },
    {
      id: "formation",
      show: true,
      link: "projet-formation.html",
      tone: "accent",
      context: { fr: "Organisme de formation", en: "Training provider" },
      status: { fr: "Développé et testé", en: "Built and tested" },
      period: "2026",
      title: { fr: "Logiciel métier pour un organisme de formation", en: "Business software for a training provider" },
      question: { fr: "Comment ouvrir un logiciel à Internet sans ouvrir un seul port ?", en: "How do you put an app on the Internet without opening a single port?" },
      summary: {
        fr: "Inscriptions, émargement par QR code, documents, facturation. Hébergé sur site, exposé sans aucun port entrant.",
        en: "Enrolment, QR code attendance, documents, invoicing. Hosted on premises, exposed without a single inbound port."
      },
      tags: ["Docker", "PostgreSQL", "CI"]
    },
    {
      id: "cabinet",
      show: true,
      link: "projet-cabinet.html",
      tone: "plain",
      context: { fr: "Cabinet comptable", en: "Accounting firm" },
      status: { fr: "Conception", en: "Design" },
      period: "2026",
      title: { fr: "Portail client pour un cabinet comptable", en: "Client portal for an accounting firm" },
      question: { fr: "Comment garantir qu'un client ne verra <em>jamais</em> les dossiers d'un autre ?", en: "How do you make sure a client will <em>never</em> see another client's files?" },
      summary: {
        fr: "Portail multi-clients : cloisonnement vérifié côté serveur, droits par rôle, banque sans identifiants.",
        en: "Multi-tenant portal: server-side isolation, role-based permissions, banking without credentials."
      },
      tags: ["Multi-tenant", "RBAC", "RGPD"]
    },
    {
      id: "psyber",
      show: true,
      link: "projet-detection.html#psyber",
      tone: "plain",
      context: { fr: "Projet d'école", en: "School project" },
      status: { fr: "Projet d'école", en: "School project" },
      period: "ESIEA",
      title: { fr: "PsyberSentinel, XDR comportementale", en: "PsyberSentinel, behavioural XDR" },
      summary: {
        fr: "Ingestion PCAP et NetFlow, logs au format OCSF, détection non supervisée en local (Isolation Forest, autoencodeurs), alertes expliquées par SHAP.",
        en: "PCAP and NetFlow ingestion, OCSF logs, local unsupervised detection (Isolation Forest, autoencoders), alerts explained with SHAP."
      },
      tags: ["OCSF", "Isolation Forest", "SHAP"]
    }
  ],

  freelance: {
    summary: {
      fr: "Sites vitrines en ligne et simulateur de devis (Quasar, Supabase).",
      en: "Live showcase websites and a quote simulator (Quasar, Supabase)."
    },
    sites: [
      { label: "ferovagroupe.fr", url: "https://ferovagroupe.fr" },
      { label: "nflconciergerie.fr", url: "https://nflconciergerie.fr" }
    ]
  },

  education: [
    { title: { fr: "Diplôme d'ingénieur, majeure cybersécurité", en: "Engineering degree, cybersecurity major" }, org: { fr: "ESIEA, Paris · alternance · mineure SI", en: "ESIEA, Paris · work-study · IS minor" }, period: "2024 – 2027" },
    { title: { fr: "BTS SIO, option SISR", en: "Two-year IT degree (BTS SIO), networks" }, org: { fr: "PROMEO · alternance", en: "PROMEO · work-study" }, period: "2022 – 2024" },
    { title: { fr: "Technicien réseau et télécoms", en: "Network and telecom technician" }, org: { fr: "Greta CFA GPI2D, Paris", en: "Greta CFA GPI2D, Paris" }, period: "2021 – 2022" }
  ],

  skills: [
    { name: { fr: "Réseau &amp; infra", en: "Networks &amp; infra" }, level: 5, label: { fr: "Point fort", en: "Strength" }, keywords: { fr: "VLAN, routage RIP / BGP, filtrage, VPN, MikroTik, Stormshield, VoIP", en: "VLAN, RIP / BGP routing, filtering, VPN, MikroTik, Stormshield, VoIP" } },
    { name: { fr: "Systèmes &amp; cloud", en: "Systems &amp; cloud" }, level: 4, label: { fr: "Solide", en: "Solid" }, keywords: { fr: "Linux, Windows Server, Active Directory, GPO, Docker, Kubernetes, Terraform, GCP et AWS (notions)", en: "Linux, Windows Server, Active Directory, GPO, Docker, Kubernetes, Terraform, GCP and AWS (basics)" } },
    { name: { fr: "Gouvernance", en: "Governance" }, level: 4, label: { fr: "Solide", en: "Solid" }, keywords: { fr: "EBIOS RM, ISO 27001 / 27005, NIST, RGPD, audit", en: "EBIOS RM, ISO 27001 / 27005, NIST, GDPR, audit" } },
    { name: { fr: "Sécurité défensive", en: "Defensive security" }, level: 3, label: { fr: "En progression", en: "Growing" }, keywords: { fr: "Durcissement, SIEM (Splunk, ELK), analyse de trafic, JA4+, forensic, sécurité du cloud", en: "Hardening, SIEM (Splunk, ELK), traffic analysis, JA4+, forensics, cloud security" } },
    { name: { fr: "Développement", en: "Development" }, level: 3, label: { fr: "Un outil", en: "A tool" }, keywords: { fr: "Python, Bash, SQL, JavaScript, CI/CD, Robot Framework, Rust (en cours)", en: "Python, Bash, SQL, JavaScript, CI/CD, Robot Framework, Rust (learning)" } },
    { name: { fr: "Sécurité offensive", en: "Offensive security" }, level: 2, label: { fr: "Notions", en: "Basics" }, keywords: { fr: "Test d'intrusion web (OWASP), reverse engineering, cryptographie", en: "Web pentesting (OWASP), reverse engineering, cryptography" } }
  ],

  languages: { fr: "Français, anglais, turc", en: "French, English, Turkish" },
  certificates: {
    fr: "MOOC Objectif IPv6 (IMT), orchestration de conteneurs avec Kubernetes, Tosa DigComp",
    en: "IPv6 MOOC (IMT), container orchestration with Kubernetes, Tosa DigComp"
  }
};
