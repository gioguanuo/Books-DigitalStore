export default function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  
  const contactInfo = {
    company: "Libreria Digitale",
    address: {
      street: "Via dei Libri 123",
      city: "Milano",
      country: "Italia",
      zipCode: "20121"
    },
    phone: "+39 02 1234567",
    email: "info@libreriadigitale.it",
    socialMedia: {
      facebook: "libreriadigitale",
      twitter: "@libreriadigit",
      instagram: "libreria_digitale",
      linkedin: "libreria-digitale"
    },
    businessHours: {
      monday: "9:00-18:00",
      tuesday: "9:00-18:00",
      wednesday: "9:00-18:00",
      thursday: "9:00-18:00",
      friday: "9:00-18:00",
      saturday: "9:00-13:00",
      sunday: "Chiuso"
    },
    support: {
      email: "support@libreriadigitale.it",
      phone: "+39 02 1234568",
      hours: "Lun-Ven 9:00-17:00"
    }
  };

  response.status(200).json({ success: true, data: contactInfo });
}