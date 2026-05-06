import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";

export type Lang = "en" | "fr" | "es" | "de" | "ar";

const translations = {
  en: {
    nav: { home: "Home", fleet: "Fleet", services: "Services", contact: "Contact", bookNow: "Book Now" },
    hero: {
      tagline: "Uncompromising", highlight: "Elegance",
      subline: "Experience the pinnacle of luxury ground transportation. Impeccable fleet, professional chauffeurs, and a commitment to absolute perfection.",
      exploreFleet: "Explore Fleet", ourServices: "Our Services",
    },
    features: {
      sectionTitle: "The Elite Standard",
      sectionSub: "Every detail of our service is curated to provide a seamless, secure, and serene journey.",
      fleet: { title: "Impeccable Fleet", desc: "Our vehicles are meticulously maintained to showroom standards, featuring the latest in luxury and technology." },
      discreet: { title: "Discreet & Secure", desc: "Your privacy and security are paramount. Our chauffeurs are trained professionals committed to discretion." },
      punctual: { title: "Absolute Punctuality", desc: "Time is the ultimate luxury. We guarantee on-time arrivals with advanced tracking and route optimization." },
    },
    fleet: { title: "Our Fleet", subtitle: "Select from our curated collection of world-class luxury vehicles.", perKm: "per km", upTo: "Up to", reserveNow: "Reserve Now", noVehicles: "No vehicles currently available.", allVehicles: "All Vehicles", transferOnly: "Transfer", hourlyCharter: "Hourly Charter" },
    services: {
      title: "Our Services", subtitle: "Tailored transportation solutions for every occasion.",
      airport: { title: "Airport Transfers", desc: "Seamless, punctual airport pickups and drop-offs with luggage assistance." },
      corporate: { title: "Corporate Travel", desc: "Executive ground transportation designed for business professionals." },
      events: { title: "Special Events", desc: "Arrive in style for weddings, galas, award ceremonies, and red carpet events." },
      hourly: { title: "Hourly Charter", desc: "Total flexibility for your day with your chauffeur on standby." },
      reserveService: "Reserve This Service", customTitle: "Require a Custom Solution?",
      customDesc: "For bespoke itineraries, multi-vehicle fleets, or long-term engagements, our concierge team is at your disposal.",
      contactConcierge: "Contact Concierge", loading: "Loading services…", noServices: "No services available.",
    },
    contact: {
      title: "Contact Us", subtitle: "Our concierge team is available 24/7 to assist you.",
      name: "Full Name", email: "Email Address", phone: "Phone (Optional)",
      message: "Message", messagePlaceholder: "How can we assist you?",
      send: "Send Message", sending: "Sending…", sent: "Message Sent",
      sentDesc: "Thank you. Our team will respond within 24 hours.",
      infoTitle: "Get In Touch", addressTitle: "Available Worldwide",
      address: "24/7 global chauffeur service", hoursTitle: "Hours of Operation",
      hours: "24 hours a day, 7 days a week",
      phoneTitle: "Phone", phoneValue: "+1 (800) ELITE-00",
      emailTitle: "Email", emailValue: "concierge@elitechauffeur.com",
    },
    terms: {
      title: "Terms & Conditions", lastUpdated: "Last updated: January 2025",
      intro: "By accessing or using Elite Chauffeur services, you agree to be bound by these Terms & Conditions. Please read them carefully.",
      s1Title: "1. Booking & Reservations",
      s1: "All reservations must be made at least 2 hours in advance. We reserve the right to decline any booking at our discretion. A confirmation email will be sent upon successful booking.",
      s2Title: "2. Cancellation Policy",
      s2: "Cancellations made more than 24 hours before the scheduled pickup time are fully refundable. Cancellations within 24 hours may incur a 50% cancellation fee. No-shows will be charged the full booking amount.",
      s3Title: "3. Pricing & Payments",
      s3: "All prices displayed are estimates based on distance and vehicle selection. Final pricing may vary based on actual distance, waiting time, tolls, and additional services requested. Payment is due upon completion of service unless otherwise agreed.",
      s4Title: "4. Passenger Conduct",
      s4: "Passengers are expected to conduct themselves in a respectful and lawful manner at all times. Elite Chauffeur reserves the right to terminate a journey if a passenger's behavior endangers the driver, vehicle, or other passengers.",
      s5Title: "5. Liability",
      s5: "Elite Chauffeur maintains full commercial insurance on all vehicles and journeys. We are not liable for delays caused by traffic conditions, weather events, road closures, or other circumstances beyond our reasonable control.",
      s6Title: "6. Privacy & Data",
      s6: "Your personal information is collected and handled in accordance with applicable privacy laws. We do not share your data with third parties without your explicit consent, except where required by law.",
      s7Title: "7. Governing Law",
      s7: "These terms and conditions are governed by applicable local and international laws. Any disputes shall be resolved through binding arbitration in the jurisdiction where the service was provided.",
      contactLine: "For questions regarding these terms, please contact us at concierge@elitechauffeur.com",
    },
    book: { title: "Secure Your Journey", subtitle: "Complete the form below to reserve your luxury transport." },
    form: {
      reserveTitle: "Reserve Your Ride", pickup: "Pickup Location", pickupPlaceholder: "Airport, Hotel, Address…",
      dropoff: "Dropoff Location", dropoffPlaceholder: "Destination address…", calculateDistance: "Calculate Distance",
      date: "Date", pickDate: "Pick a date", time: "Time (24h)", vehicle: "Select Vehicle",
      vehiclePlaceholder: "Choose a luxury vehicle", chauffeur: "Chauffeur Service", chauffeurDesc: "Include a professional driver",
      fullName: "Full Name", email: "Email Address", phone: "Phone Number (Optional)",
      notes: "Special Requirements", notesPlaceholder: "Child seat, excess luggage…",
      submit: "Request Reservation", processing: "Processing…", loadingVehicles: "Loading vehicles…", noVehicles: "No vehicles available",
    },
    price: {
      distance: "Distance", baseFee: "Base fee", distanceCost: "Distance cost", chauffeurFee: "Chauffeur fee",
      estimatedTotal: "Estimated Total", calculateToSeeTotal: "Calculate distance to see full total", baseOnly: "Base price (no distance yet)",
      from: "From", to: "To",
    },
    footer: { rights: "All rights reserved.", contact: "Contact", terms: "Terms & Conditions" },
    admin: {
      portal: "Admin Portal", eliteChauffeur: "Elite Chauffeur", signOut: "Sign Out",
      nav: { dashboard: "Dashboard", reservations: "Reservations", calendar: "Calendar", cars: "Cars", drivers: "Drivers", pricing: "Pricing", services: "Services", settings: "Settings" },
      login: { title: "Administration", subtitle: "Elite Chauffeur — Restricted Access", password: "Admin Password", placeholder: "Enter password", signIn: "Sign In", verifying: "Verifying...", note: "Authorised personnel only" },
      dashboard: {
        title: "Overview", totalRevenue: "Total Revenue", reservations: "Reservations",
        fleetStatus: "Fleet Status", drivers: "Drivers", pending: "pending", confirmed: "confirmed",
        vehiclesAvailable: "Vehicles available", driversOnDuty: "Drivers on duty",
        revenueOverview: "Revenue Overview", recentActivity: "Recent Activity",
      },
      reservations: {
        title: "Reservations", filterStatus: "Filter Status", allStatuses: "All Statuses",
        id: "ID", customer: "Customer", dateTime: "Date / Time", route: "Route", amount: "Amount",
        status: "Status", action: "Action", details: "Details", noReservations: "No reservations found.",
        customerInfo: "Customer Info", journeyDetails: "Journey Details", assignment: "Assignment",
        billing: "Billing Breakdown", notes: "Notes", pickup: "Pickup", dropoff: "Dropoff",
        vehicle: "Vehicle", driver: "Driver", unassigned: "Unassigned", total: "Total",
        noPhone: "No phone provided", sendReminder: "Send Email Reminder", reminderTo: "Send Reminder to",
        cancel: "Cancel", send: "Send Reminder", loading: "Loading…",
        statuses: { pending: "Pending", confirmed: "Confirmed", in_progress: "In Progress", completed: "Completed", cancelled: "Cancelled" },
      },
      cars: {
        title: "Fleet Management", addVehicle: "Add Vehicle", editVehicle: "Edit Vehicle",
        photo: "Photo", vehicle: "Vehicle", category: "Category", capacity: "Capacity",
        priceCol: "Pricing", statusCol: "Status", actions: "Actions", noCars: "No vehicles found.",
        internalName: "Internal Name", brand: "Brand", model: "Model", year: "Year",
        pricePerKm: "Price / km", baseFee: "Base Fee", driverFee: "Driver / Chauffeur Fee",
        driverFeeNote: "Added when \"With Driver\" is selected", availableLabel: "Available for booking",
        description: "Description", features: "Features (comma-separated)", featuresPlaceholder: "WiFi, Leather Seats…",
        vehiclePhoto: "Vehicle Photo", noPhoto: "No photo",
        available: "Available", unavailable: "Unavailable", withDriver: "With Driver Only",
        withoutDriver: "Without Driver Only", both: "Both",
        hourlyLabel: "Available for Hourly Charter", hourlyNote: "Show this vehicle in the Hourly Charter fleet tab",
      },
      drivers: {
        title: "Chauffeur Management", addDriver: "Add Driver", editChauffeur: "Edit Chauffeur",
        addChauffeur: "Add Chauffeur", noDrivers: "No drivers found.", contact: "Contact",
        languages: "Languages", notSpecified: "Not specified", yearsExp: "years experience",
        noPhone: "No phone", noEmail: "No email", fullName: "Full Name", phone: "Phone",
        email: "Email", rating: "Rating (0–5)", experience: "Years Experience",
        langLabel: "Languages (comma-separated)", photoUrl: "Photo URL (Optional)",
        activeStatus: "Active Status", availableForAssignment: "Available for assignments",
      },
      pricing: {
        title: "Pricing Rules", addRule: "Add Rule", editRule: "Edit Pricing Rule",
        addRuleTitle: "Add Pricing Rule", noRules: "No pricing rules defined.",
        ruleName: "Rule Name", baseFee: "Base Fee", pricePerKm: "Price / km",
        category: "Category", description: "Description", withDriver: "With Driver", withoutDriver: "Without Driver", both: "Both",
      },
      services: {
        title: "Services Management", addService: "Add Service", editService: "Edit Service",
        saveService: "Save Service", noServices: "No services yet. Add your first one.",
        iconLabel: "Icon Name", imageLabel: "Image URL", orderLabel: "Sort Order",
        activeLabel: "Visible on website", titleLabel: "Service Title", descLabel: "Description",
        iconPlaceholder: "e.g. Plane, Clock, Car…", imagePlaceholder: "https://…",
        descPlaceholder: "Describe this service…", actions: "Actions",
        iconNote: "Use any Lucide icon name: Plane, Car, Clock, Building2, CalendarDays, Shield, Star, Users…",
      },
      settings: {
        title: "Site Settings", bookingForm: "Booking Form", bookingFormDesc: "Control which options are visible to customers.",
        chauffeurOption: "Chauffeur Service option", chauffeurOnDesc: "Customers can choose to include or exclude a professional driver.",
        chauffeurOffDesc: "The chauffeur toggle is hidden — all bookings include a driver.",
        currencyCard: "Currency", currencyDesc: "Set the currency displayed throughout the site on all price displays.",
        currencyLabel: "Currency", currencySaved: "Currency updated", currencySavedDesc: "Price displays updated site-wide.",
        passwordCard: "Change Admin Password", passwordDesc: "Update your administration password. Minimum 6 characters.",
        currentPwd: "Current Password", newPwd: "New Password", confirmPwd: "Confirm New Password",
        currentPlaceholder: "Enter current password", newPlaceholder: "At least 6 characters",
        confirmPlaceholder: "Repeat new password", updatePwd: "Update Password", updating: "Updating...",
        settingSaved: "Setting saved", settingSavedDesc: "Changes are live on the booking form.",
        pwdUpdated: "Password updated", pwdUpdatedDesc: "Your admin password has been changed successfully.",
      },
      calendar: {
        title: "Calendar", days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      },
      common: { loading: "Loading...", save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit", add: "Add", actions: "Actions", areYouSure: "Are you sure?" },
    },
  },

  fr: {
    nav: { home: "Accueil", fleet: "Flotte", services: "Services", contact: "Contact", bookNow: "Réserver" },
    hero: {
      tagline: "Élégance", highlight: "Sans Compromis",
      subline: "Découvrez le summum du transport terrestre de luxe. Flotte impeccable, chauffeurs professionnels et engagement envers la perfection absolue.",
      exploreFleet: "Voir la Flotte", ourServices: "Nos Services",
    },
    features: {
      sectionTitle: "La Norme Élite",
      sectionSub: "Chaque détail de notre service est conçu pour offrir un voyage fluide, sécurisé et serein.",
      fleet: { title: "Flotte Impeccable", desc: "Nos véhicules sont entretenus avec soin aux normes de la salle d'exposition." },
      discreet: { title: "Discret & Sécurisé", desc: "Votre vie privée et votre sécurité sont primordiales." },
      punctual: { title: "Ponctualité Absolue", desc: "Le temps est le luxe ultime. Nous garantissons des arrivées ponctuelles." },
    },
    fleet: { title: "Notre Flotte", subtitle: "Choisissez parmi notre collection de véhicules de luxe.", perKm: "par km", upTo: "Jusqu'à", reserveNow: "Réserver", noVehicles: "Aucun véhicule disponible.", allVehicles: "Tous les véhicules", transferOnly: "Transfert", hourlyCharter: "Location à l'Heure" },
    services: {
      title: "Nos Services", subtitle: "Des solutions de transport sur mesure pour chaque occasion.",
      airport: { title: "Transferts Aéroport", desc: "Prise en charge et dépôt ponctuels à l'aéroport." },
      corporate: { title: "Voyages d'Affaires", desc: "Transport terrestre exécutif pour les professionnels." },
      events: { title: "Événements Spéciaux", desc: "Arrivez avec élégance pour les mariages et galas." },
      hourly: { title: "Location à l'Heure", desc: "Flexibilité totale pour votre journée." },
      reserveService: "Réserver ce Service", customTitle: "Besoin d'une Solution Sur Mesure ?",
      customDesc: "Pour des itinéraires sur mesure, notre équipe de conciergerie est à votre disposition.",
      contactConcierge: "Contacter le Concierge", loading: "Chargement des services…", noServices: "Aucun service disponible.",
    },
    contact: {
      title: "Contactez-nous", subtitle: "Notre équipe de conciergerie est disponible 24h/7j.",
      name: "Nom Complet", email: "Adresse Email", phone: "Téléphone (Optionnel)",
      message: "Message", messagePlaceholder: "Comment pouvons-nous vous aider ?",
      send: "Envoyer le Message", sending: "Envoi en cours…", sent: "Message Envoyé",
      sentDesc: "Merci. Notre équipe répondra dans les 24 heures.",
      infoTitle: "Prendre Contact", addressTitle: "Disponible Partout",
      address: "Service chauffeur mondial 24h/7j", hoursTitle: "Heures d'Ouverture",
      hours: "24 heures par jour, 7 jours par semaine",
      phoneTitle: "Téléphone", phoneValue: "+1 (800) ELITE-00",
      emailTitle: "Email", emailValue: "concierge@elitechauffeur.com",
    },
    terms: {
      title: "Conditions Générales", lastUpdated: "Dernière mise à jour : janvier 2025",
      intro: "En accédant ou en utilisant les services Elite Chauffeur, vous acceptez d'être lié par ces Conditions Générales.",
      s1Title: "1. Réservations", s1: "Toutes les réservations doivent être effectuées au moins 2 heures à l'avance. Nous nous réservons le droit de refuser toute réservation à notre discrétion.",
      s2Title: "2. Politique d'Annulation", s2: "Les annulations effectuées plus de 24 heures avant l'heure de prise en charge sont entièrement remboursées. Les annulations dans les 24 heures peuvent entraîner des frais de 50 %.",
      s3Title: "3. Tarification", s3: "Tous les prix affichés sont des estimations. La tarification finale peut varier en fonction de la distance réelle, du temps d'attente et des services supplémentaires.",
      s4Title: "4. Comportement des Passagers", s4: "Les passagers doivent se conduire de manière respectueuse. Nous nous réservons le droit de mettre fin à un trajet si le comportement d'un passager met en danger le conducteur ou le véhicule.",
      s5Title: "5. Responsabilité", s5: "Elite Chauffeur maintient une assurance commerciale complète. Nous ne sommes pas responsables des retards causés par la circulation, la météo ou des circonstances indépendantes de notre volonté.",
      s6Title: "6. Confidentialité", s6: "Vos informations personnelles sont traitées conformément aux lois applicables. Nous ne partageons pas vos données sans votre consentement.",
      s7Title: "7. Droit Applicable", s7: "Ces conditions sont régies par les lois locales et internationales applicables.",
      contactLine: "Pour toute question, contactez-nous à concierge@elitechauffeur.com",
    },
    book: { title: "Sécurisez Votre Trajet", subtitle: "Complétez le formulaire pour réserver votre transport de luxe." },
    form: {
      reserveTitle: "Réservez Votre Course", pickup: "Lieu de Prise en Charge", pickupPlaceholder: "Aéroport, Hôtel, Adresse…",
      dropoff: "Lieu de Dépose", dropoffPlaceholder: "Adresse de destination…", calculateDistance: "Calculer la Distance",
      date: "Date", pickDate: "Choisir une date", time: "Heure (24h)", vehicle: "Choisir un Véhicule",
      vehiclePlaceholder: "Sélectionnez un véhicule de luxe", chauffeur: "Service Chauffeur", chauffeurDesc: "Inclure un chauffeur professionnel",
      fullName: "Nom Complet", email: "Adresse Email", phone: "Téléphone (Optionnel)",
      notes: "Demandes Spéciales", notesPlaceholder: "Siège enfant, bagages supplémentaires…",
      submit: "Demander une Réservation", processing: "En cours…", loadingVehicles: "Chargement…", noVehicles: "Aucun véhicule disponible",
    },
    price: {
      distance: "Distance", baseFee: "Frais de base", distanceCost: "Coût kilométrique", chauffeurFee: "Frais chauffeur",
      estimatedTotal: "Total Estimé", calculateToSeeTotal: "Calculez la distance pour voir le total", baseOnly: "Prix de base (distance non calculée)",
      from: "De", to: "À",
    },
    footer: { rights: "Tous droits réservés.", contact: "Contact", terms: "Conditions Générales" },
    admin: {
      portal: "Portail Admin", eliteChauffeur: "Elite Chauffeur", signOut: "Déconnexion",
      nav: { dashboard: "Tableau de bord", reservations: "Réservations", calendar: "Calendrier", cars: "Véhicules", drivers: "Chauffeurs", pricing: "Tarifs", services: "Services", settings: "Paramètres" },
      login: { title: "Administration", subtitle: "Elite Chauffeur — Accès Restreint", password: "Mot de passe admin", placeholder: "Entrez le mot de passe", signIn: "Se connecter", verifying: "Vérification...", note: "Personnel autorisé uniquement" },
      dashboard: {
        title: "Vue d'ensemble", totalRevenue: "Revenus Totaux", reservations: "Réservations",
        fleetStatus: "État de la Flotte", drivers: "Chauffeurs", pending: "en attente", confirmed: "confirmées",
        vehiclesAvailable: "Véhicules disponibles", driversOnDuty: "Chauffeurs en service",
        revenueOverview: "Aperçu des Revenus", recentActivity: "Activité Récente",
      },
      reservations: {
        title: "Réservations", filterStatus: "Filtrer par statut", allStatuses: "Tous les statuts",
        id: "N°", customer: "Client", dateTime: "Date / Heure", route: "Trajet", amount: "Montant",
        status: "Statut", action: "Action", details: "Détails", noReservations: "Aucune réservation trouvée.",
        customerInfo: "Infos Client", journeyDetails: "Détails du Trajet", assignment: "Assignation",
        billing: "Détail de Facturation", notes: "Notes", pickup: "Prise en charge", dropoff: "Dépose",
        vehicle: "Véhicule", driver: "Chauffeur", unassigned: "Non assigné", total: "Total",
        noPhone: "Aucun téléphone", sendReminder: "Envoyer un Rappel", reminderTo: "Rappel à",
        cancel: "Annuler", send: "Envoyer", loading: "Chargement…",
        statuses: { pending: "En attente", confirmed: "Confirmée", in_progress: "En cours", completed: "Terminée", cancelled: "Annulée" },
      },
      cars: {
        title: "Gestion de la Flotte", addVehicle: "Ajouter un Véhicule", editVehicle: "Modifier le Véhicule",
        photo: "Photo", vehicle: "Véhicule", category: "Catégorie", capacity: "Capacité",
        priceCol: "Tarif", statusCol: "Statut", actions: "Actions", noCars: "Aucun véhicule trouvé.",
        internalName: "Nom interne", brand: "Marque", model: "Modèle", year: "Année",
        pricePerKm: "Prix / km", baseFee: "Frais de base", driverFee: "Frais chauffeur",
        driverFeeNote: "Ajouté quand \"Avec chauffeur\" est sélectionné", availableLabel: "Disponible à la réservation",
        description: "Description", features: "Équipements (séparés par virgule)", featuresPlaceholder: "WiFi, Sièges cuir…",
        vehiclePhoto: "Photo du véhicule", noPhoto: "Pas de photo",
        available: "Disponible", unavailable: "Indisponible", withDriver: "Avec chauffeur uniquement",
        withoutDriver: "Sans chauffeur uniquement", both: "Les deux",
        hourlyLabel: "Disponible pour Location à l'Heure", hourlyNote: "Afficher ce véhicule dans l'onglet Location à l'Heure",
      },
      drivers: {
        title: "Gestion des Chauffeurs", addDriver: "Ajouter un Chauffeur", editChauffeur: "Modifier le Chauffeur",
        addChauffeur: "Ajouter un Chauffeur", noDrivers: "Aucun chauffeur trouvé.", contact: "Contact",
        languages: "Langues", notSpecified: "Non spécifié", yearsExp: "ans d'expérience",
        noPhone: "Pas de téléphone", noEmail: "Pas d'email", fullName: "Nom complet", phone: "Téléphone",
        email: "Email", rating: "Note (0–5)", experience: "Années d'expérience",
        langLabel: "Langues (séparées par virgule)", photoUrl: "URL de la photo (optionnel)",
        activeStatus: "Statut actif", availableForAssignment: "Disponible pour les missions",
      },
      pricing: {
        title: "Règles Tarifaires", addRule: "Ajouter une Règle", editRule: "Modifier la Règle",
        addRuleTitle: "Ajouter une Règle Tarifaire", noRules: "Aucune règle tarifaire définie.",
        ruleName: "Nom de la règle", baseFee: "Frais de base", pricePerKm: "Prix / km",
        category: "Catégorie", description: "Description", withDriver: "Avec chauffeur", withoutDriver: "Sans chauffeur", both: "Les deux",
      },
      services: {
        title: "Gestion des Services", addService: "Ajouter un Service", editService: "Modifier le Service",
        saveService: "Enregistrer le Service", noServices: "Aucun service. Ajoutez votre premier.",
        iconLabel: "Nom de l'Icône", imageLabel: "URL de l'image", orderLabel: "Ordre d'affichage",
        activeLabel: "Visible sur le site", titleLabel: "Titre du Service", descLabel: "Description",
        iconPlaceholder: "ex. Plane, Clock, Car…", imagePlaceholder: "https://…",
        descPlaceholder: "Décrivez ce service…", actions: "Actions",
        iconNote: "Utilisez un nom d'icône Lucide : Plane, Car, Clock, Building2, CalendarDays, Shield, Star, Users…",
      },
      settings: {
        title: "Paramètres du Site", bookingForm: "Formulaire de Réservation", bookingFormDesc: "Contrôlez les options visibles aux clients.",
        chauffeurOption: "Option Service Chauffeur", chauffeurOnDesc: "Les clients peuvent choisir d'inclure ou d'exclure un chauffeur.",
        chauffeurOffDesc: "Le bouton chauffeur est masqué — toutes les réservations incluent un chauffeur.",
        currencyCard: "Devise", currencyDesc: "Définissez la devise affichée sur tous les tarifs du site.",
        currencyLabel: "Devise", currencySaved: "Devise mise à jour", currencySavedDesc: "Affichage des prix mis à jour partout.",
        passwordCard: "Changer le Mot de Passe Admin", passwordDesc: "Mettez à jour votre mot de passe. Minimum 6 caractères.",
        currentPwd: "Mot de passe actuel", newPwd: "Nouveau mot de passe", confirmPwd: "Confirmer le nouveau mot de passe",
        currentPlaceholder: "Entrez le mot de passe actuel", newPlaceholder: "Au moins 6 caractères",
        confirmPlaceholder: "Répétez le nouveau mot de passe", updatePwd: "Mettre à jour", updating: "Mise à jour...",
        settingSaved: "Paramètre enregistré", settingSavedDesc: "Modifications appliquées au formulaire.",
        pwdUpdated: "Mot de passe mis à jour", pwdUpdatedDesc: "Votre mot de passe a été changé avec succès.",
      },
      calendar: { title: "Calendrier", days: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"] },
      common: { loading: "Chargement...", save: "Enregistrer", cancel: "Annuler", delete: "Supprimer", edit: "Modifier", add: "Ajouter", actions: "Actions", areYouSure: "Êtes-vous sûr ?" },
    },
  },

  es: {
    nav: { home: "Inicio", fleet: "Flota", services: "Servicios", contact: "Contacto", bookNow: "Reservar" },
    hero: {
      tagline: "Elegancia", highlight: "Sin Compromiso",
      subline: "Experimente la cima del transporte terrestre de lujo. Flota impecable, choferes profesionales y un compromiso con la perfección absoluta.",
      exploreFleet: "Ver Flota", ourServices: "Nuestros Servicios",
    },
    features: {
      sectionTitle: "El Estándar Élite",
      sectionSub: "Cada detalle de nuestro servicio está diseñado para ofrecer un viaje fluido, seguro y sereno.",
      fleet: { title: "Flota Impecable", desc: "Nuestros vehículos se mantienen a estándares de sala de exposición." },
      discreet: { title: "Discreto y Seguro", desc: "Su privacidad y seguridad son primordiales." },
      punctual: { title: "Puntualidad Absoluta", desc: "El tiempo es el máximo lujo. Garantizamos llegadas puntuales." },
    },
    fleet: { title: "Nuestra Flota", subtitle: "Seleccione de nuestra colección de vehículos de lujo.", perKm: "por km", upTo: "Hasta", reserveNow: "Reservar Ahora", noVehicles: "No hay vehículos disponibles.", allVehicles: "Todos los Vehículos", transferOnly: "Traslado", hourlyCharter: "Alquiler por Horas" },
    services: {
      title: "Nuestros Servicios", subtitle: "Soluciones de transporte a medida para cada ocasión.",
      airport: { title: "Traslados al Aeropuerto", desc: "Recogidas y entregas puntuales en el aeropuerto." },
      corporate: { title: "Viajes Corporativos", desc: "Transporte ejecutivo para profesionales de negocios." },
      events: { title: "Eventos Especiales", desc: "Llegue con estilo a bodas, galas y ceremonias." },
      hourly: { title: "Alquiler por Horas", desc: "Flexibilidad total para su día." },
      reserveService: "Reservar Este Servicio", customTitle: "¿Necesita una Solución Personalizada?",
      customDesc: "Para itinerarios a medida, nuestro equipo de conserjería está a su disposición.",
      contactConcierge: "Contactar Conserjería", loading: "Cargando servicios…", noServices: "No hay servicios disponibles.",
    },
    contact: {
      title: "Contáctenos", subtitle: "Nuestro equipo de conserjería está disponible 24/7.",
      name: "Nombre Completo", email: "Correo Electrónico", phone: "Teléfono (Opcional)",
      message: "Mensaje", messagePlaceholder: "¿Cómo podemos ayudarle?",
      send: "Enviar Mensaje", sending: "Enviando…", sent: "Mensaje Enviado",
      sentDesc: "Gracias. Nuestro equipo responderá en 24 horas.",
      infoTitle: "Póngase en Contacto", addressTitle: "Disponible en Todo el Mundo",
      address: "Servicio de chofer mundial 24/7", hoursTitle: "Horario de Atención",
      hours: "24 horas al día, 7 días a la semana",
      phoneTitle: "Teléfono", phoneValue: "+1 (800) ELITE-00",
      emailTitle: "Email", emailValue: "concierge@elitechauffeur.com",
    },
    terms: {
      title: "Términos y Condiciones", lastUpdated: "Última actualización: enero 2025",
      intro: "Al acceder o utilizar los servicios Elite Chauffeur, acepta estar sujeto a estos Términos y Condiciones.",
      s1Title: "1. Reservas", s1: "Todas las reservas deben realizarse con al menos 2 horas de antelación. Nos reservamos el derecho de rechazar cualquier reserva.",
      s2Title: "2. Política de Cancelación", s2: "Las cancelaciones con más de 24 horas de antelación son totalmente reembolsables. Las cancelaciones en 24 horas pueden incurrir en un cargo del 50%.",
      s3Title: "3. Precios", s3: "Todos los precios mostrados son estimaciones. El precio final puede variar según la distancia real, el tiempo de espera y los servicios adicionales.",
      s4Title: "4. Conducta de los Pasajeros", s4: "Los pasajeros deben comportarse de manera respetuosa. Nos reservamos el derecho de terminar un viaje si el comportamiento pone en peligro al conductor o al vehículo.",
      s5Title: "5. Responsabilidad", s5: "Elite Chauffeur mantiene seguro comercial completo. No somos responsables de los retrasos causados por el tráfico, el clima u otras circunstancias fuera de nuestro control.",
      s6Title: "6. Privacidad", s6: "Su información personal se maneja de acuerdo con las leyes de privacidad aplicables. No compartimos sus datos sin su consentimiento.",
      s7Title: "7. Ley Aplicable", s7: "Estos términos se rigen por las leyes locales e internacionales aplicables.",
      contactLine: "Para preguntas, contáctenos en concierge@elitechauffeur.com",
    },
    book: { title: "Asegure Su Viaje", subtitle: "Complete el formulario para reservar su transporte de lujo." },
    form: {
      reserveTitle: "Reserve Su Viaje", pickup: "Lugar de Recogida", pickupPlaceholder: "Aeropuerto, Hotel, Dirección…",
      dropoff: "Lugar de Destino", dropoffPlaceholder: "Dirección de destino…", calculateDistance: "Calcular Distancia",
      date: "Fecha", pickDate: "Seleccionar fecha", time: "Hora (24h)", vehicle: "Seleccionar Vehículo",
      vehiclePlaceholder: "Elegir un vehículo de lujo", chauffeur: "Servicio de Chofer", chauffeurDesc: "Incluir un conductor profesional",
      fullName: "Nombre Completo", email: "Correo Electrónico", phone: "Teléfono (Opcional)",
      notes: "Requisitos Especiales", notesPlaceholder: "Silla infantil, equipaje extra…",
      submit: "Solicitar Reserva", processing: "Procesando…", loadingVehicles: "Cargando…", noVehicles: "No hay vehículos disponibles",
    },
    price: {
      distance: "Distancia", baseFee: "Tarifa base", distanceCost: "Costo por distancia", chauffeurFee: "Tarifa del chofer",
      estimatedTotal: "Total Estimado", calculateToSeeTotal: "Calcule la distancia para ver el total", baseOnly: "Precio base (sin distancia calculada)",
      from: "Desde", to: "Hasta",
    },
    footer: { rights: "Todos los derechos reservados.", contact: "Contacto", terms: "Términos y Condiciones" },
    admin: {
      portal: "Portal Admin", eliteChauffeur: "Elite Chauffeur", signOut: "Cerrar Sesión",
      nav: { dashboard: "Panel", reservations: "Reservas", calendar: "Calendario", cars: "Vehículos", drivers: "Conductores", pricing: "Tarifas", services: "Servicios", settings: "Ajustes" },
      login: { title: "Administración", subtitle: "Elite Chauffeur — Acceso Restringido", password: "Contraseña admin", placeholder: "Ingrese la contraseña", signIn: "Iniciar Sesión", verifying: "Verificando...", note: "Solo personal autorizado" },
      dashboard: {
        title: "Resumen", totalRevenue: "Ingresos Totales", reservations: "Reservas",
        fleetStatus: "Estado de la Flota", drivers: "Conductores", pending: "pendiente", confirmed: "confirmada",
        vehiclesAvailable: "Vehículos disponibles", driversOnDuty: "Conductores de servicio",
        revenueOverview: "Resumen de Ingresos", recentActivity: "Actividad Reciente",
      },
      reservations: {
        title: "Reservas", filterStatus: "Filtrar estado", allStatuses: "Todos los estados",
        id: "N°", customer: "Cliente", dateTime: "Fecha / Hora", route: "Ruta", amount: "Importe",
        status: "Estado", action: "Acción", details: "Detalles", noReservations: "No se encontraron reservas.",
        customerInfo: "Info del Cliente", journeyDetails: "Detalles del Viaje", assignment: "Asignación",
        billing: "Desglose de Facturación", notes: "Notas", pickup: "Recogida", dropoff: "Destino",
        vehicle: "Vehículo", driver: "Conductor", unassigned: "Sin asignar", total: "Total",
        noPhone: "Sin teléfono", sendReminder: "Enviar Recordatorio", reminderTo: "Recordatorio a",
        cancel: "Cancelar", send: "Enviar", loading: "Cargando…",
        statuses: { pending: "Pendiente", confirmed: "Confirmada", in_progress: "En Curso", completed: "Completada", cancelled: "Cancelada" },
      },
      cars: {
        title: "Gestión de Flota", addVehicle: "Agregar Vehículo", editVehicle: "Editar Vehículo",
        photo: "Foto", vehicle: "Vehículo", category: "Categoría", capacity: "Capacidad",
        priceCol: "Precio", statusCol: "Estado", actions: "Acciones", noCars: "No se encontraron vehículos.",
        internalName: "Nombre interno", brand: "Marca", model: "Modelo", year: "Año",
        pricePerKm: "Precio / km", baseFee: "Tarifa base", driverFee: "Tarifa chofer",
        driverFeeNote: "Se añade cuando se selecciona \"Con conductor\"", availableLabel: "Disponible para reservas",
        description: "Descripción", features: "Características (separadas por coma)", featuresPlaceholder: "WiFi, Asientos de cuero…",
        vehiclePhoto: "Foto del vehículo", noPhoto: "Sin foto",
        available: "Disponible", unavailable: "No disponible", withDriver: "Solo con conductor",
        withoutDriver: "Solo sin conductor", both: "Ambos",
        hourlyLabel: "Disponible para Alquiler por Horas", hourlyNote: "Mostrar en la pestaña de Alquiler por Horas",
      },
      drivers: {
        title: "Gestión de Conductores", addDriver: "Agregar Conductor", editChauffeur: "Editar Conductor",
        addChauffeur: "Agregar Conductor", noDrivers: "No se encontraron conductores.", contact: "Contacto",
        languages: "Idiomas", notSpecified: "No especificado", yearsExp: "años de experiencia",
        noPhone: "Sin teléfono", noEmail: "Sin email", fullName: "Nombre completo", phone: "Teléfono",
        email: "Email", rating: "Calificación (0–5)", experience: "Años de experiencia",
        langLabel: "Idiomas (separados por coma)", photoUrl: "URL de foto (opcional)",
        activeStatus: "Estado activo", availableForAssignment: "Disponible para asignaciones",
      },
      pricing: {
        title: "Reglas de Tarifas", addRule: "Agregar Regla", editRule: "Editar Regla de Tarifa",
        addRuleTitle: "Agregar Regla de Tarifa", noRules: "No hay reglas de tarifas definidas.",
        ruleName: "Nombre de la regla", baseFee: "Tarifa base", pricePerKm: "Precio / km",
        category: "Categoría", description: "Descripción", withDriver: "Con conductor", withoutDriver: "Sin conductor", both: "Ambos",
      },
      services: {
        title: "Gestión de Servicios", addService: "Agregar Servicio", editService: "Editar Servicio",
        saveService: "Guardar Servicio", noServices: "Sin servicios. Añada el primero.",
        iconLabel: "Nombre del Icono", imageLabel: "URL de imagen", orderLabel: "Orden",
        activeLabel: "Visible en el sitio", titleLabel: "Título del Servicio", descLabel: "Descripción",
        iconPlaceholder: "ej. Plane, Clock, Car…", imagePlaceholder: "https://…",
        descPlaceholder: "Describa este servicio…", actions: "Acciones",
        iconNote: "Use cualquier nombre de icono Lucide: Plane, Car, Clock, Building2, CalendarDays…",
      },
      settings: {
        title: "Configuración del Sitio", bookingForm: "Formulario de Reserva", bookingFormDesc: "Controla qué opciones son visibles para los clientes.",
        chauffeurOption: "Opción Servicio de Conductor", chauffeurOnDesc: "Los clientes pueden elegir incluir o excluir un conductor.",
        chauffeurOffDesc: "El interruptor del conductor está oculto — todas las reservas incluyen conductor.",
        currencyCard: "Moneda", currencyDesc: "Establezca la moneda mostrada en todos los precios del sitio.",
        currencyLabel: "Moneda", currencySaved: "Moneda actualizada", currencySavedDesc: "Precios actualizados en todo el sitio.",
        passwordCard: "Cambiar Contraseña Admin", passwordDesc: "Actualiza tu contraseña. Mínimo 6 caracteres.",
        currentPwd: "Contraseña actual", newPwd: "Nueva contraseña", confirmPwd: "Confirmar nueva contraseña",
        currentPlaceholder: "Ingresa la contraseña actual", newPlaceholder: "Al menos 6 caracteres",
        confirmPlaceholder: "Repite la nueva contraseña", updatePwd: "Actualizar Contraseña", updating: "Actualizando...",
        settingSaved: "Configuración guardada", settingSavedDesc: "Los cambios están activos en el formulario.",
        pwdUpdated: "Contraseña actualizada", pwdUpdatedDesc: "Tu contraseña ha sido cambiada con éxito.",
      },
      calendar: { title: "Calendario", days: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] },
      common: { loading: "Cargando...", save: "Guardar", cancel: "Cancelar", delete: "Eliminar", edit: "Editar", add: "Agregar", actions: "Acciones", areYouSure: "¿Está seguro?" },
    },
  },

  de: {
    nav: { home: "Startseite", fleet: "Fuhrpark", services: "Leistungen", contact: "Kontakt", bookNow: "Buchen" },
    hero: {
      tagline: "Kompromisslose", highlight: "Eleganz",
      subline: "Erleben Sie den Gipfel des Luxus-Bodentransports. Makellose Fahrzeuge, professionelle Chauffeure und Engagement für absolute Perfektion.",
      exploreFleet: "Fuhrpark Entdecken", ourServices: "Unsere Leistungen",
    },
    features: {
      sectionTitle: "Der Elite-Standard",
      sectionSub: "Jedes Detail unseres Services ist darauf ausgerichtet, eine nahtlose, sichere und ruhige Reise zu bieten.",
      fleet: { title: "Makelloser Fuhrpark", desc: "Unsere Fahrzeuge werden akribisch auf Showroom-Niveau gehalten." },
      discreet: { title: "Diskret & Sicher", desc: "Ihre Privatsphäre und Sicherheit haben oberste Priorität." },
      punctual: { title: "Absolute Pünktlichkeit", desc: "Zeit ist der ultimative Luxus. Wir garantieren pünktliche Ankünfte." },
    },
    fleet: { title: "Unser Fuhrpark", subtitle: "Wählen Sie aus unserer Kollektion erstklassiger Luxusfahrzeuge.", perKm: "pro km", upTo: "Bis zu", reserveNow: "Jetzt Reservieren", noVehicles: "Derzeit keine Fahrzeuge verfügbar.", allVehicles: "Alle Fahrzeuge", transferOnly: "Transfer", hourlyCharter: "Stundenmiete" },
    services: {
      title: "Unsere Leistungen", subtitle: "Maßgeschneiderte Transportlösungen für jeden Anlass.",
      airport: { title: "Flughafentransfers", desc: "Nahtlose, pünktliche Abholungen und Absetzungen am Flughafen." },
      corporate: { title: "Geschäftsreisen", desc: "Exekutivtransport für Geschäftsleute." },
      events: { title: "Besondere Anlässe", desc: "Kommen Sie stilvoll zu Hochzeiten, Galas und Zeremonien." },
      hourly: { title: "Stundenmiete", desc: "Völlige Flexibilität für Ihren Tag." },
      reserveService: "Diesen Service Buchen", customTitle: "Benötigen Sie eine individuelle Lösung?",
      customDesc: "Für maßgeschneiderte Reiserouten steht Ihnen unser Concierge-Team zur Verfügung.",
      contactConcierge: "Concierge Kontaktieren", loading: "Dienste werden geladen…", noServices: "Keine Dienste verfügbar.",
    },
    contact: {
      title: "Kontakt", subtitle: "Unser Concierge-Team ist 24/7 für Sie da.",
      name: "Vollständiger Name", email: "E-Mail-Adresse", phone: "Telefon (Optional)",
      message: "Nachricht", messagePlaceholder: "Wie können wir Ihnen helfen?",
      send: "Nachricht Senden", sending: "Wird gesendet…", sent: "Nachricht Gesendet",
      sentDesc: "Vielen Dank. Unser Team antwortet innerhalb von 24 Stunden.",
      infoTitle: "Kontakt Aufnehmen", addressTitle: "Weltweit Verfügbar",
      address: "24/7 globaler Chauffeur-Service", hoursTitle: "Öffnungszeiten",
      hours: "24 Stunden am Tag, 7 Tage die Woche",
      phoneTitle: "Telefon", phoneValue: "+1 (800) ELITE-00",
      emailTitle: "E-Mail", emailValue: "concierge@elitechauffeur.com",
    },
    terms: {
      title: "Allgemeine Geschäftsbedingungen", lastUpdated: "Letzte Aktualisierung: Januar 2025",
      intro: "Durch den Zugriff auf oder die Nutzung von Elite Chauffeur-Diensten stimmen Sie diesen AGB zu.",
      s1Title: "1. Buchungen", s1: "Alle Reservierungen müssen mindestens 2 Stunden im Voraus erfolgen. Wir behalten uns das Recht vor, jede Buchung abzulehnen.",
      s2Title: "2. Stornierungsrichtlinie", s2: "Stornierungen mehr als 24 Stunden vor der Abholzeit werden vollständig erstattet. Stornierungen innerhalb von 24 Stunden können eine Gebühr von 50% verursachen.",
      s3Title: "3. Preisgestaltung", s3: "Alle angezeigten Preise sind Schätzungen. Der Endpreis kann je nach tatsächlicher Distanz, Wartezeit und zusätzlichen Leistungen variieren.",
      s4Title: "4. Verhalten der Fahrgäste", s4: "Fahrgäste müssen sich respektvoll verhalten. Wir behalten uns das Recht vor, eine Fahrt zu beenden, wenn das Verhalten eines Fahrgastes den Fahrer oder das Fahrzeug gefährdet.",
      s5Title: "5. Haftung", s5: "Elite Chauffeur verfügt über eine vollständige Betriebsversicherung. Wir haften nicht für Verzögerungen durch Verkehr, Wetter oder unvorhersehbare Ereignisse.",
      s6Title: "6. Datenschutz", s6: "Ihre personenbezogenen Daten werden gemäß geltenden Datenschutzgesetzen verarbeitet.",
      s7Title: "7. Geltendes Recht", s7: "Diese AGB unterliegen dem anwendbaren lokalen und internationalen Recht.",
      contactLine: "Bei Fragen kontaktieren Sie uns unter concierge@elitechauffeur.com",
    },
    book: { title: "Ihre Reise Sichern", subtitle: "Füllen Sie das Formular aus, um Ihren Luxustransport zu reservieren." },
    form: {
      reserveTitle: "Reise Reservieren", pickup: "Abholort", pickupPlaceholder: "Flughafen, Hotel, Adresse…",
      dropoff: "Zielort", dropoffPlaceholder: "Zieladresse…", calculateDistance: "Entfernung Berechnen",
      date: "Datum", pickDate: "Datum wählen", time: "Uhrzeit (24h)", vehicle: "Fahrzeug Wählen",
      vehiclePlaceholder: "Luxusfahrzeug auswählen", chauffeur: "Chauffeur-Service", chauffeurDesc: "Professionellen Fahrer einschließen",
      fullName: "Vollständiger Name", email: "E-Mail-Adresse", phone: "Telefonnummer (Optional)",
      notes: "Besondere Wünsche", notesPlaceholder: "Kindersitz, Übergepäck…",
      submit: "Reservierung Anfragen", processing: "Wird verarbeitet…", loadingVehicles: "Wird geladen…", noVehicles: "Keine Fahrzeuge verfügbar",
    },
    price: {
      distance: "Entfernung", baseFee: "Grundgebühr", distanceCost: "Kilometerkosten", chauffeurFee: "Chauffeurgebühr",
      estimatedTotal: "Geschätzter Gesamtbetrag", calculateToSeeTotal: "Entfernung berechnen für Gesamtbetrag", baseOnly: "Grundpreis (noch keine Entfernung)",
      from: "Von", to: "Nach",
    },
    footer: { rights: "Alle Rechte vorbehalten.", contact: "Kontakt", terms: "AGB" },
    admin: {
      portal: "Admin-Portal", eliteChauffeur: "Elite Chauffeur", signOut: "Abmelden",
      nav: { dashboard: "Übersicht", reservations: "Reservierungen", calendar: "Kalender", cars: "Fahrzeuge", drivers: "Fahrer", pricing: "Preise", services: "Dienste", settings: "Einstellungen" },
      login: { title: "Verwaltung", subtitle: "Elite Chauffeur — Eingeschränkter Zugang", password: "Admin-Passwort", placeholder: "Passwort eingeben", signIn: "Anmelden", verifying: "Überprüfung...", note: "Nur autorisiertes Personal" },
      dashboard: {
        title: "Übersicht", totalRevenue: "Gesamtumsatz", reservations: "Reservierungen",
        fleetStatus: "Fuhrpark-Status", drivers: "Fahrer", pending: "ausstehend", confirmed: "bestätigt",
        vehiclesAvailable: "Verfügbare Fahrzeuge", driversOnDuty: "Fahrer im Dienst",
        revenueOverview: "Umsatzübersicht", recentActivity: "Letzte Aktivitäten",
      },
      reservations: {
        title: "Reservierungen", filterStatus: "Status filtern", allStatuses: "Alle Status",
        id: "Nr.", customer: "Kunde", dateTime: "Datum / Uhrzeit", route: "Strecke", amount: "Betrag",
        status: "Status", action: "Aktion", details: "Details", noReservations: "Keine Reservierungen gefunden.",
        customerInfo: "Kundeninfo", journeyDetails: "Reisedetails", assignment: "Zuweisung",
        billing: "Kostenaufstellung", notes: "Notizen", pickup: "Abholort", dropoff: "Zielort",
        vehicle: "Fahrzeug", driver: "Fahrer", unassigned: "Nicht zugewiesen", total: "Gesamt",
        noPhone: "Kein Telefon", sendReminder: "E-Mail-Erinnerung senden", reminderTo: "Erinnerung an",
        cancel: "Abbrechen", send: "Senden", loading: "Laden…",
        statuses: { pending: "Ausstehend", confirmed: "Bestätigt", in_progress: "In Bearbeitung", completed: "Abgeschlossen", cancelled: "Storniert" },
      },
      cars: {
        title: "Fuhrparkverwaltung", addVehicle: "Fahrzeug Hinzufügen", editVehicle: "Fahrzeug Bearbeiten",
        photo: "Foto", vehicle: "Fahrzeug", category: "Kategorie", capacity: "Kapazität",
        priceCol: "Preis", statusCol: "Status", actions: "Aktionen", noCars: "Keine Fahrzeuge gefunden.",
        internalName: "Interner Name", brand: "Marke", model: "Modell", year: "Jahr",
        pricePerKm: "Preis / km", baseFee: "Grundgebühr", driverFee: "Fahrergebühr",
        driverFeeNote: "Hinzugefügt bei Auswahl \"Mit Fahrer\"", availableLabel: "Verfügbar zur Buchung",
        description: "Beschreibung", features: "Ausstattung (kommagetrennt)", featuresPlaceholder: "WLAN, Ledersitze…",
        vehiclePhoto: "Fahrzeugfoto", noPhoto: "Kein Foto",
        available: "Verfügbar", unavailable: "Nicht verfügbar", withDriver: "Nur mit Fahrer",
        withoutDriver: "Nur ohne Fahrer", both: "Beides",
        hourlyLabel: "Verfügbar für Stundenmiete", hourlyNote: "In der Stundenmiete-Registerkarte anzeigen",
      },
      drivers: {
        title: "Fahrerverwaltung", addDriver: "Fahrer Hinzufügen", editChauffeur: "Fahrer Bearbeiten",
        addChauffeur: "Fahrer Hinzufügen", noDrivers: "Keine Fahrer gefunden.", contact: "Kontakt",
        languages: "Sprachen", notSpecified: "Nicht angegeben", yearsExp: "Jahre Erfahrung",
        noPhone: "Kein Telefon", noEmail: "Keine E-Mail", fullName: "Vollständiger Name", phone: "Telefon",
        email: "E-Mail", rating: "Bewertung (0–5)", experience: "Jahre Erfahrung",
        langLabel: "Sprachen (kommagetrennt)", photoUrl: "Foto-URL (optional)",
        activeStatus: "Aktivstatus", availableForAssignment: "Für Einsätze verfügbar",
      },
      pricing: {
        title: "Preisregeln", addRule: "Regel Hinzufügen", editRule: "Preisregel Bearbeiten",
        addRuleTitle: "Preisregel Hinzufügen", noRules: "Keine Preisregeln definiert.",
        ruleName: "Regelname", baseFee: "Grundgebühr", pricePerKm: "Preis / km",
        category: "Kategorie", description: "Beschreibung", withDriver: "Mit Fahrer", withoutDriver: "Ohne Fahrer", both: "Beides",
      },
      services: {
        title: "Dienstverwaltung", addService: "Dienst Hinzufügen", editService: "Dienst Bearbeiten",
        saveService: "Dienst Speichern", noServices: "Keine Dienste. Fügen Sie den ersten hinzu.",
        iconLabel: "Symbolname", imageLabel: "Bild-URL", orderLabel: "Reihenfolge",
        activeLabel: "Auf Website sichtbar", titleLabel: "Dienstbezeichnung", descLabel: "Beschreibung",
        iconPlaceholder: "z.B. Plane, Clock, Car…", imagePlaceholder: "https://…",
        descPlaceholder: "Beschreiben Sie diesen Dienst…", actions: "Aktionen",
        iconNote: "Verwenden Sie einen Lucide-Symbolnamen: Plane, Car, Clock, Building2, CalendarDays…",
      },
      settings: {
        title: "Websiteeinstellungen", bookingForm: "Buchungsformular", bookingFormDesc: "Steuern Sie, welche Optionen Kunden sehen.",
        chauffeurOption: "Chauffeur-Service-Option", chauffeurOnDesc: "Kunden können wählen, ob ein Fahrer eingeschlossen ist.",
        chauffeurOffDesc: "Der Chauffeur-Schalter ist ausgeblendet — alle Buchungen beinhalten einen Fahrer.",
        currencyCard: "Währung", currencyDesc: "Legen Sie die Währung fest, die auf allen Preisanzeigen angezeigt wird.",
        currencyLabel: "Währung", currencySaved: "Währung aktualisiert", currencySavedDesc: "Preisanzeigen im gesamten Standort aktualisiert.",
        passwordCard: "Admin-Passwort Ändern", passwordDesc: "Aktualisieren Sie Ihr Passwort. Mindestens 6 Zeichen.",
        currentPwd: "Aktuelles Passwort", newPwd: "Neues Passwort", confirmPwd: "Neues Passwort bestätigen",
        currentPlaceholder: "Aktuelles Passwort eingeben", newPlaceholder: "Mindestens 6 Zeichen",
        confirmPlaceholder: "Neues Passwort wiederholen", updatePwd: "Passwort Aktualisieren", updating: "Aktualisierung...",
        settingSaved: "Einstellung gespeichert", settingSavedDesc: "Änderungen sind im Buchungsformular aktiv.",
        pwdUpdated: "Passwort aktualisiert", pwdUpdatedDesc: "Ihr Passwort wurde erfolgreich geändert.",
      },
      calendar: { title: "Kalender", days: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"] },
      common: { loading: "Laden...", save: "Speichern", cancel: "Abbrechen", delete: "Löschen", edit: "Bearbeiten", add: "Hinzufügen", actions: "Aktionen", areYouSure: "Sind Sie sicher?" },
    },
  },

  ar: {
    nav: { home: "الرئيسية", fleet: "الأسطول", services: "الخدمات", contact: "اتصل بنا", bookNow: "احجز الآن" },
    hero: {
      tagline: "أناقة", highlight: "لا تُضاهى",
      subline: "اختبر قمة الفخامة في النقل البري. أسطول لا تشوبه شائبة، سائقون محترفون، والتزام بالكمال المطلق.",
      exploreFleet: "استكشف الأسطول", ourServices: "خدماتنا",
    },
    features: {
      sectionTitle: "معيار النخبة",
      sectionSub: "كل تفصيل في خدمتنا مُصمَّم لتوفير رحلة سلسة وآمنة وهادئة.",
      fleet: { title: "أسطول لا مثيل له", desc: "تُصان مركباتنا بدقة على مستوى غرف العرض مع أحدث تقنيات الفخامة." },
      discreet: { title: "سرية وأمان", desc: "خصوصيتك وأمانك في المقام الأول. سائقونا محترفون مُدرَّبون على السرية التامة." },
      punctual: { title: "الالتزام بالوقت", desc: "الوقت هو الرفاهية القصوى. نضمن الوصول في الموعد المحدد دائماً." },
    },
    fleet: { title: "أسطولنا", subtitle: "اختر من مجموعتنا المنتقاة من مركبات الفخامة العالمية.", perKm: "لكل كم", upTo: "حتى", reserveNow: "احجز الآن", noVehicles: "لا توجد مركبات متاحة حالياً.", allVehicles: "جميع المركبات", transferOnly: "نقل", hourlyCharter: "الإيجار بالساعة" },
    services: {
      title: "خدماتنا", subtitle: "حلول نقل مُصمَّمة لكل مناسبة.",
      airport: { title: "نقل المطار", desc: "استقبال وتوديع دقيق في المطار مع مساعدة بالأمتعة." },
      corporate: { title: "السفر للأعمال", desc: "نقل تنفيذي مُصمَّم لرجال الأعمال المحترفين." },
      events: { title: "المناسبات الخاصة", desc: "احضر بأناقة لحفلات الزفاف والمهرجانات والحفلات الرسمية." },
      hourly: { title: "الإيجار بالساعة", desc: "مرونة تامة في يومك مع سائقك في انتظارك." },
      reserveService: "احجز هذه الخدمة", customTitle: "تحتاج إلى حل مخصص؟",
      customDesc: "لمسارات مصممة خصيصاً أو أساطيل متعددة، فريق الكونسيرج لديك في خدمتك.",
      contactConcierge: "تواصل مع الكونسيرج", loading: "جارٍ تحميل الخدمات…", noServices: "لا توجد خدمات متاحة.",
    },
    contact: {
      title: "اتصل بنا", subtitle: "فريق الكونسيرج لدينا متاح على مدار الساعة طوال الأسبوع.",
      name: "الاسم الكامل", email: "البريد الإلكتروني", phone: "الهاتف (اختياري)",
      message: "الرسالة", messagePlaceholder: "كيف يمكننا مساعدتك؟",
      send: "إرسال الرسالة", sending: "جارٍ الإرسال…", sent: "تم إرسال الرسالة",
      sentDesc: "شكراً لك. سيرد فريقنا خلال 24 ساعة.",
      infoTitle: "تواصل معنا", addressTitle: "متاح في جميع أنحاء العالم",
      address: "خدمة سائق عالمية على مدار الساعة", hoursTitle: "ساعات العمل",
      hours: "24 ساعة في اليوم، 7 أيام في الأسبوع",
      phoneTitle: "الهاتف", phoneValue: "+1 (800) ELITE-00",
      emailTitle: "البريد الإلكتروني", emailValue: "concierge@elitechauffeur.com",
    },
    terms: {
      title: "الشروط والأحكام", lastUpdated: "آخر تحديث: يناير 2025",
      intro: "باستخدام خدمات إيليت شوفير، فإنك توافق على الالتزام بهذه الشروط والأحكام.",
      s1Title: "١. الحجوزات", s1: "يجب إجراء جميع الحجوزات قبل ساعتين على الأقل. نحتفظ بحق رفض أي حجز وفق تقديرنا.",
      s2Title: "٢. سياسة الإلغاء", s2: "الإلغاء قبل 24 ساعة من موعد الاستقبال يُسترد بالكامل. قد يترتب على الإلغاء خلال 24 ساعة رسوم بنسبة 50٪.",
      s3Title: "٣. التسعير", s3: "جميع الأسعار المعروضة تقديرية. قد يختلف السعر النهائي بناءً على المسافة الفعلية ووقت الانتظار والخدمات الإضافية.",
      s4Title: "٤. سلوك الركاب", s4: "يُتوقع من الركاب التصرف باحترام. نحتفظ بحق إنهاء الرحلة إذا عرّض سلوك الراكب السائق أو المركبة للخطر.",
      s5Title: "٥. المسؤولية", s5: "تمتلك إيليت شوفير تأميناً تجارياً شاملاً. لسنا مسؤولين عن التأخيرات الناجمة عن حركة المرور أو الطقس أو ظروف خارجة عن إرادتنا.",
      s6Title: "٦. الخصوصية", s6: "يتم التعامل مع معلوماتك الشخصية وفقاً لقوانين الخصوصية المعمول بها. لا نشارك بياناتك دون موافقتك.",
      s7Title: "٧. القانون الحاكم", s7: "تخضع هذه الشروط للقوانين المحلية والدولية المعمول بها.",
      contactLine: "للاستفسار عن هذه الشروط، يرجى التواصل على concierge@elitechauffeur.com",
    },
    book: { title: "أمّن رحلتك", subtitle: "أكمل النموذج أدناه لحجز وسيلة النقل الفاخرة الخاصة بك." },
    form: {
      reserveTitle: "احجز رحلتك", pickup: "موقع الانطلاق", pickupPlaceholder: "المطار، الفندق، العنوان…",
      dropoff: "موقع الوصول", dropoffPlaceholder: "عنوان الوجهة…", calculateDistance: "احسب المسافة",
      date: "التاريخ", pickDate: "اختر تاريخاً", time: "الوقت (24 ساعة)", vehicle: "اختر المركبة",
      vehiclePlaceholder: "اختر مركبة فاخرة", chauffeur: "خدمة السائق", chauffeurDesc: "تضمين سائق محترف",
      fullName: "الاسم الكامل", email: "البريد الإلكتروني", phone: "رقم الهاتف (اختياري)",
      notes: "متطلبات خاصة", notesPlaceholder: "مقعد أطفال، أمتعة زائدة…",
      submit: "طلب الحجز", processing: "جارٍ المعالجة…", loadingVehicles: "جارٍ التحميل…", noVehicles: "لا توجد مركبات متاحة",
    },
    price: {
      distance: "المسافة", baseFee: "الرسوم الأساسية", distanceCost: "تكلفة المسافة", chauffeurFee: "رسوم السائق",
      estimatedTotal: "الإجمالي التقديري", calculateToSeeTotal: "احسب المسافة لرؤية الإجمالي الكامل", baseOnly: "السعر الأساسي (بدون مسافة)",
      from: "من", to: "إلى",
    },
    footer: { rights: "جميع الحقوق محفوظة.", contact: "اتصل بنا", terms: "الشروط والأحكام" },
    admin: {
      portal: "بوابة الإدارة", eliteChauffeur: "إيليت شوفير", signOut: "تسجيل الخروج",
      nav: { dashboard: "لوحة التحكم", reservations: "الحجوزات", calendar: "التقويم", cars: "المركبات", drivers: "السائقون", pricing: "الأسعار", services: "الخدمات", settings: "الإعدادات" },
      login: { title: "الإدارة", subtitle: "إيليت شوفير — وصول مقيد", password: "كلمة مرور المدير", placeholder: "أدخل كلمة المرور", signIn: "تسجيل الدخول", verifying: "جارٍ التحقق...", note: "للموظفين المُصرَّح لهم فقط" },
      dashboard: {
        title: "نظرة عامة", totalRevenue: "إجمالي الإيرادات", reservations: "الحجوزات",
        fleetStatus: "حالة الأسطول", drivers: "السائقون", pending: "معلق", confirmed: "مؤكد",
        vehiclesAvailable: "مركبات متاحة", driversOnDuty: "سائقون في الخدمة",
        revenueOverview: "نظرة عامة على الإيرادات", recentActivity: "النشاط الأخير",
      },
      reservations: {
        title: "الحجوزات", filterStatus: "تصفية الحالة", allStatuses: "جميع الحالات",
        id: "الرقم", customer: "العميل", dateTime: "التاريخ / الوقت", route: "المسار", amount: "المبلغ",
        status: "الحالة", action: "الإجراء", details: "التفاصيل", noReservations: "لم يُعثَر على حجوزات.",
        customerInfo: "معلومات العميل", journeyDetails: "تفاصيل الرحلة", assignment: "التعيين",
        billing: "تفصيل الفاتورة", notes: "ملاحظات", pickup: "نقطة الانطلاق", dropoff: "نقطة الوصول",
        vehicle: "المركبة", driver: "السائق", unassigned: "غير مُعيَّن", total: "المجموع",
        noPhone: "لا يوجد هاتف", sendReminder: "إرسال تذكير بالبريد", reminderTo: "تذكير إلى",
        cancel: "إلغاء", send: "إرسال", loading: "جارٍ التحميل…",
        statuses: { pending: "معلق", confirmed: "مؤكد", in_progress: "قيد التنفيذ", completed: "مكتمل", cancelled: "ملغى" },
      },
      cars: {
        title: "إدارة الأسطول", addVehicle: "إضافة مركبة", editVehicle: "تعديل المركبة",
        photo: "الصورة", vehicle: "المركبة", category: "الفئة", capacity: "الطاقة",
        priceCol: "السعر", statusCol: "الحالة", actions: "الإجراءات", noCars: "لم يُعثَر على مركبات.",
        internalName: "الاسم الداخلي", brand: "الماركة", model: "الموديل", year: "السنة",
        pricePerKm: "السعر / كم", baseFee: "الرسوم الأساسية", driverFee: "رسوم السائق",
        driverFeeNote: "يُضاف عند اختيار \"مع سائق\"", availableLabel: "متاح للحجز",
        description: "الوصف", features: "المميزات (مفصولة بفاصلة)", featuresPlaceholder: "واي فاي، مقاعد جلدية…",
        vehiclePhoto: "صورة المركبة", noPhoto: "لا توجد صورة",
        available: "متاح", unavailable: "غير متاح", withDriver: "مع سائق فقط",
        withoutDriver: "بدون سائق فقط", both: "كلاهما",
        hourlyLabel: "متاح للإيجار بالساعة", hourlyNote: "عرض هذه المركبة في تبويب الإيجار بالساعة",
      },
      drivers: {
        title: "إدارة السائقين", addDriver: "إضافة سائق", editChauffeur: "تعديل السائق",
        addChauffeur: "إضافة سائق", noDrivers: "لم يُعثَر على سائقين.", contact: "التواصل",
        languages: "اللغات", notSpecified: "غير محدد", yearsExp: "سنوات خبرة",
        noPhone: "لا يوجد هاتف", noEmail: "لا يوجد بريد", fullName: "الاسم الكامل", phone: "الهاتف",
        email: "البريد الإلكتروني", rating: "التقييم (0–5)", experience: "سنوات الخبرة",
        langLabel: "اللغات (مفصولة بفاصلة)", photoUrl: "رابط الصورة (اختياري)",
        activeStatus: "الحالة النشطة", availableForAssignment: "متاح للمهام",
      },
      pricing: {
        title: "قواعد التسعير", addRule: "إضافة قاعدة", editRule: "تعديل قاعدة التسعير",
        addRuleTitle: "إضافة قاعدة تسعير", noRules: "لم يتم تحديد قواعد تسعير.",
        ruleName: "اسم القاعدة", baseFee: "الرسوم الأساسية", pricePerKm: "السعر / كم",
        category: "الفئة", description: "الوصف", withDriver: "مع سائق", withoutDriver: "بدون سائق", both: "كلاهما",
      },
      services: {
        title: "إدارة الخدمات", addService: "إضافة خدمة", editService: "تعديل الخدمة",
        saveService: "حفظ الخدمة", noServices: "لا توجد خدمات. أضف أولها.",
        iconLabel: "اسم الأيقونة", imageLabel: "رابط الصورة", orderLabel: "ترتيب العرض",
        activeLabel: "مرئي على الموقع", titleLabel: "عنوان الخدمة", descLabel: "الوصف",
        iconPlaceholder: "مثل: Plane, Clock, Car…", imagePlaceholder: "https://…",
        descPlaceholder: "صف هذه الخدمة…", actions: "الإجراءات",
        iconNote: "استخدم أي اسم أيقونة Lucide: Plane, Car, Clock, Building2, CalendarDays, Shield, Star, Users…",
      },
      settings: {
        title: "إعدادات الموقع", bookingForm: "نموذج الحجز", bookingFormDesc: "التحكم في الخيارات المرئية للعملاء.",
        chauffeurOption: "خيار خدمة السائق", chauffeurOnDesc: "يمكن للعملاء اختيار تضمين أو استثناء السائق.",
        chauffeurOffDesc: "خيار السائق مخفي — جميع الحجوزات تشمل سائقاً.",
        currencyCard: "العملة", currencyDesc: "حدد العملة المعروضة في جميع أسعار الموقع.",
        currencyLabel: "العملة", currencySaved: "تم تحديث العملة", currencySavedDesc: "تم تحديث عروض الأسعار في جميع أنحاء الموقع.",
        passwordCard: "تغيير كلمة مرور المدير", passwordDesc: "حدّث كلمة مرورك. 6 أحرف على الأقل.",
        currentPwd: "كلمة المرور الحالية", newPwd: "كلمة المرور الجديدة", confirmPwd: "تأكيد كلمة المرور الجديدة",
        currentPlaceholder: "أدخل كلمة المرور الحالية", newPlaceholder: "6 أحرف على الأقل",
        confirmPlaceholder: "كرر كلمة المرور الجديدة", updatePwd: "تحديث كلمة المرور", updating: "جارٍ التحديث...",
        settingSaved: "تم حفظ الإعداد", settingSavedDesc: "التغييرات مُطبَّقة على نموذج الحجز.",
        pwdUpdated: "تم تحديث كلمة المرور", pwdUpdatedDesc: "تم تغيير كلمة مرورك بنجاح.",
      },
      calendar: { title: "التقويم", days: ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"] },
      common: { loading: "جارٍ التحميل...", save: "حفظ", cancel: "إلغاء", delete: "حذف", edit: "تعديل", add: "إضافة", actions: "الإجراءات", areYouSure: "هل أنت متأكد؟" },
    },
  },
};

type Translations = typeof translations.en;

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
  isRtl: boolean;
}

const I18nContext = createContext<I18nContextType>({
  lang: "en", setLang: () => {}, t: translations.en, isRtl: false,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const stored = (typeof localStorage !== "undefined" ? localStorage.getItem("lang") : null) as Lang | null;
  const [lang, setLangState] = useState<Lang>(stored && stored in translations ? stored : "en");
  const isRtl = lang === "ar";

  useEffect(() => {
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang, isRtl]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  }, []);

  return (
    <I18nContext.Provider value={{ lang, setLang, t: translations[lang] as Translations, isRtl }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

const LANG_META: Record<Lang, { label: string; name: string; flag: React.ReactNode }> = {
  en: { label: "EN", name: "English", flag: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="20" height="14" aria-hidden="true">
      <clipPath id="gb-c"><path d="M0 0v30h60V0z"/></clipPath>
      <path d="M0 0v30h60V0z" fill="#012169"/>
      <path d="M0 0l60 30M60 0L0 30" stroke="#fff" strokeWidth="6"/>
      <path d="M0 0l60 30M60 0L0 30" stroke="#C8102E" strokeWidth="4" clipPath="url(#gb-c)"/>
      <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/>
      <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6"/>
    </svg>
  )},
  fr: { label: "FR", name: "Français", flag: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" width="20" height="14" aria-hidden="true">
      <rect width="1" height="2" fill="#002395"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#ED2939"/>
    </svg>
  )},
  es: { label: "ES", name: "Español", flag: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" width="20" height="14" aria-hidden="true">
      <rect width="3" height="2" fill="#AA151B"/><rect y="0.5" width="3" height="1" fill="#F1BF00"/>
    </svg>
  )},
  de: { label: "DE", name: "Deutsch", flag: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" width="20" height="14" aria-hidden="true">
      <rect width="5" height="3" fill="#000"/><rect y="1" width="5" height="2" fill="#D00"/><rect y="2" width="5" height="1" fill="#FFCE00"/>
    </svg>
  )},
  ar: { label: "AR", name: "العربية", flag: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" width="20" height="14" aria-hidden="true">
      <rect width="3" height="2" fill="#007A3D"/>
      <rect y="0.67" width="3" height="0.66" fill="#fff"/>
      <rect y="1.33" width="3" height="0.67" fill="#000"/>
      <rect x="0" width="0.6" height="2" fill="#CE1126"/>
    </svg>
  )},
};

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useI18n();

  return (
    <div className="relative inline-flex items-center">
      <div className="absolute left-2 pointer-events-none z-10 flex items-center" style={{ lineHeight: 0 }}>
        {LANG_META[lang].flag}
      </div>
      <select
        value={lang}
        onChange={e => setLang(e.target.value as Lang)}
        className="appearance-none bg-background border border-border rounded text-xs font-medium text-foreground pl-8 pr-6 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary hover:border-primary/50 transition-colors"
        style={{ direction: "ltr" }}
      >
        {(Object.keys(LANG_META) as Lang[]).map(l => (
          <option key={l} value={l}>{LANG_META[l].label} — {LANG_META[l].name}</option>
        ))}
      </select>
      <div className="absolute right-2 pointer-events-none text-muted-foreground">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </div>
    </div>
  );
}
