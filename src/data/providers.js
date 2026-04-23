export const categories = [
  "Todos",
  "Electricidad",      // 1. Emergencia más frecuente en hogares
  "Plomería",          // 2. Emergencia muy frecuente
  "Aseo & Limpieza",   // 3. Alta demanda diaria (hogares, oficinas)
  "Domicilios",        // 4. Muy alta demanda en Cali
  "Tecnología",        // 5. Computadores, celulares, TV
  "Pintura",           // 6. Remodelaciones frecuentes
  "Mantenimiento",     // 7. General (aires, calentadores, etc.)
  "Carpintería",       // 8. Muebles y madera
  "Mensajería",        // 9. Diligencias y envíos
  "Mecánica",          // 10. Reparación de motos y carros
  "Jardinería",        // 11. Conjuntos y casas
  "Coaches & Fitness", // 12. Entrenadores personales
  "Mudanzas",          // 13. Fletes y embalaje
  "Otro"
];


export const mockProviders = [
  {
    id: 1,
    name: "Carlos Rivera",
    serviceTitle: "Plomero Experto",
    category: "Plomería",
    description: "Reparación de tuberías, filtraciones y destape de cañerías. Más de 10 años de experiencia en Cali.",
    phone: "+573001234567",
    thumbsUp: 24,
    thumbsDown: 1,
    avatar: "https://i.pravatar.cc/150?u=carlos",
    verified: true,
    reviews: [
      { author: "María López", date: "12 abr 2026", text: "Excelente servicio, llegó puntual y resolvió la fuga en menos de una hora. 100% recomendado.", vote: "up" },
      { author: "Pedro Gómez", date: "3 mar 2026", text: "Buen trabajo, precio justo. Muy profesional y ordenado.", vote: "up" },
      { author: "Laura S.", date: "15 ene 2026", text: "Demoró un poco más de lo esperado pero el trabajo quedó perfecto.", vote: "up" }
    ]
  },
  {
    id: 2,
    name: "Marta Gómez",
    serviceTitle: "Mensajería Rápida",
    category: "Mensajería",
    description: "Diligencias, pagos, envío de paquetes pequeños a toda la ciudad en moto.",
    phone: "+573109876543",
    thumbsUp: 56,
    thumbsDown: 2,
    avatar: "https://i.pravatar.cc/150?u=marta",
    verified: true,
    reviews: [
      { author: "Empresa ABC", date: "20 abr 2026", text: "Confiable y muy rápida. Lleva nuestros documentos todos los viernes sin falta.", vote: "up" },
      { author: "Camila Torres", date: "8 abr 2026", text: "Excelente persona, muy responsable con las entregas.", vote: "up" },
      { author: "Ricardo M.", date: "22 feb 2026", text: "Una vez llegó tarde por el tráfico, pero avisó con tiempo. Buen servicio.", vote: "up" },
      { author: "Juan P.", date: "5 ene 2026", text: "El envío llegó algo dañado, no estaba bien empacado.", vote: "down" }
    ]
  },
  {
    id: 3,
    name: "Luis Fernando",
    serviceTitle: "Técnico Electricista",
    category: "Electricidad",
    description: "Instalaciones eléctricas residenciales, cortos y cableado estructurado. Certificado.",
    phone: "+573151112233",
    thumbsUp: 45,
    thumbsDown: 5,
    avatar: "https://i.pravatar.cc/150?u=luis",
    verified: true,
    reviews: [
      { author: "Sara Henao", date: "18 abr 2026", text: "Resolvió el corto eléctrico que nadie más podía encontrar. Muy profesional.", vote: "up" },
      { author: "Daniel Ríos", date: "2 abr 2026", text: "Buen trabajo aunque un poco costoso para lo que era.", vote: "up" },
      { author: "Casa Familia Vargas", date: "10 mar 2026", text: "Llegó a tiempo, hizo la instalación limpiamente y explicó todo muy bien.", vote: "up" }
    ]
  },
  {
    id: 4,
    name: "Andrea Salazar",
    serviceTitle: "Instructora Personal & Coach",
    category: "Coaching",
    description: "Entrenamiento funcional a domicilio y asesoría nutricional para cambiar tu estilo de vida.",
    phone: "+573205556677",
    thumbsUp: 89,
    thumbsDown: 0,
    avatar: "https://i.pravatar.cc/150?u=andrea",
    verified: true,
    reviews: [
      { author: "Valentina Cruz", date: "21 abr 2026", text: "¡Cambió mi vida! En 3 meses bajé 8kg y me siento con una energía increíble.", vote: "up" },
      { author: "Andrés Jiménez", date: "14 abr 2026", text: "Super profesional, paciente y muy motivadora. Muy recomendada.", vote: "up" },
      { author: "Ana M.", date: "29 mar 2026", text: "El plan nutricional que diseñó para mí es práctico y delicioso. Excelente.", vote: "up" },
      { author: "Familia Ospina", date: "15 feb 2026", text: "Nos entrena a toda la familia los sábados. Los niños la aman.", vote: "up" }
    ]
  },
  {
    id: 5,
    name: "Taller Hermanos Ruiz",
    serviceTitle: "Reparación de TV y PCs",
    category: "Mantenimiento",
    description: "Arreglamos pantallas, formateamos computadores, cambiamos discos duros y recuperamos datos.",
    phone: "+573189998877",
    thumbsUp: 112,
    thumbsDown: 14,
    avatar: "https://i.pravatar.cc/150?u=taller",
    verified: true,
    reviews: [
      { author: "Nicolas Reyes", date: "19 abr 2026", text: "Recuperaron todos mis datos de un disco duro dañado. ¡Salvaron mi tesis!", vote: "up" },
      { author: "Beatriz Londoño", date: "10 abr 2026", text: "Repararon mi TV en 2 días y a buen precio.", vote: "up" },
      { author: "Tintorería La 5ta", date: "28 mar 2026", text: "Me formatearon el PC de la empresa y quedó impecable.", vote: "up" },
      { author: "Cliente Anónimo", date: "5 feb 2026", text: "El arreglo duró poco tiempo, tuve que volver a llevar el equipo.", vote: "down" }
    ]
  },
  {
    id: 6,
    name: "Jorge M.",
    serviceTitle: "Pintor de Interiores",
    category: "Pintura",
    description: "Pintura de apartamentos, casas y oficinas. Acabados lisos, estuco y arreglos de humedad.",
    phone: "+573167771234",
    thumbsUp: 15,
    thumbsDown: 0,
    avatar: "https://i.pravatar.cc/150?u=jorge",
    verified: true,
    reviews: [
      { author: "Almacén Ferretero", date: "11 abr 2026", text: "Pintó la fachada del local, quedó espectacular. Muy limpio en su trabajo.", vote: "up" },
      { author: "Sandra V.", date: "20 mar 2026", text: "El estuco de mi sala quedó de revista. Completamente recomendado.", vote: "up" }
    ]
  },
  {
    id: 7,
    name: "Don Efraín",
    serviceTitle: "Carpintería y Ebanistería",
    category: "Carpintería",
    description: "Restauración de muebles, clósets a medida y puertas. Madera de alta calidad.",
    phone: "+573214445566",
    thumbsUp: 41,
    thumbsDown: 3,
    avatar: "https://i.pravatar.cc/150?u=efrain",
    verified: true,
    reviews: [
      { author: "Claudia B.", date: "17 abr 2026", text: "El clóset quedó exactamente como lo quería. Calidad excelente.", vote: "up" },
      { author: "Roberto H.", date: "5 abr 2026", text: "Restauró unas sillas antiguas de la familia. Quedaron como nuevas.", vote: "up" },
      { author: "Isabel P.", date: "12 feb 2026", text: "Tardó más de lo acordado pero el resultado final valió la pena.", vote: "up" }
    ]
  },
  {
    id: 8,
    name: "CaliVerde",
    serviceTitle: "Jardinería Profesional",
    category: "Jardinería",
    description: "Poda de césped, diseño de jardines pequeños, siembra y mantenimiento de abono.",
    phone: "+573007778899",
    thumbsUp: 33,
    thumbsDown: 1,
    avatar: "https://i.pravatar.cc/150?u=caliverde",
    verified: true,
    reviews: [
      { author: "Conjunto Nogales", date: "19 abr 2026", text: "Manejan las zonas verdes del conjunto. Siempre puntuales y el jardín siempre impecable.", vote: "up" },
      { author: "Luisa M.", date: "2 abr 2026", text: "Diseñaron un jardín vertical en mi balcón. Quedó precioso.", vote: "up" },
      { author: "Carlos D.", date: "18 mar 2026", text: "Buen servicio aunque una vez usaron abono que mató parte de mi césped.", vote: "down" }
    ]
  }
];
