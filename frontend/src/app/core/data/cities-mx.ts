export interface MexicanCity {
  name: string;
  state: string;
}

export const CITIES_MX: MexicanCity[] = [
  // Aguascalientes
  { name: 'Aguascalientes', state: 'Aguascalientes' },

  // Baja California
  { name: 'Tijuana', state: 'Baja California' },
  { name: 'Mexicali', state: 'Baja California' },
  { name: 'Ensenada', state: 'Baja California' },
  { name: 'Tecate', state: 'Baja California' },
  { name: 'Rosarito', state: 'Baja California' },

  // Baja California Sur
  { name: 'La Paz', state: 'Baja California Sur' },
  { name: 'Los Cabos', state: 'Baja California Sur' },
  { name: 'Loreto', state: 'Baja California Sur' },

  // Campeche
  { name: 'Campeche', state: 'Campeche' },
  { name: 'Ciudad del Carmen', state: 'Campeche' },

  // Chiapas
  { name: 'Tuxtla Gutiérrez', state: 'Chiapas' },
  { name: 'San Cristóbal de las Casas', state: 'Chiapas' },
  { name: 'Tapachula', state: 'Chiapas' },
  { name: 'Comitán', state: 'Chiapas' },

  // Chihuahua
  { name: 'Chihuahua', state: 'Chihuahua' },
  { name: 'Ciudad Juárez', state: 'Chihuahua' },
  { name: 'Delicias', state: 'Chihuahua' },
  { name: 'Cuauhtémoc', state: 'Chihuahua' },
  { name: 'Parral', state: 'Chihuahua' },
  { name: 'Nuevo Casas Grandes', state: 'Chihuahua' },

  // Ciudad de México
  { name: 'Ciudad de México', state: 'Ciudad de México' },

  // Coahuila
  { name: 'Saltillo', state: 'Coahuila' },
  { name: 'Torreón', state: 'Coahuila' },
  { name: 'Monclova', state: 'Coahuila' },
  { name: 'Piedras Negras', state: 'Coahuila' },
  { name: 'Acuña', state: 'Coahuila' },

  // Colima
  { name: 'Colima', state: 'Colima' },
  { name: 'Manzanillo', state: 'Colima' },
  { name: 'Tecomán', state: 'Colima' },

  // Durango
  { name: 'Durango', state: 'Durango' },
  { name: 'Gómez Palacio', state: 'Durango' },

  // Estado de México
  { name: 'Toluca', state: 'Estado de México' },
  { name: 'Ecatepec', state: 'Estado de México' },
  { name: 'Naucalpan', state: 'Estado de México' },
  { name: 'Tlalnepantla', state: 'Estado de México' },
  { name: 'Texcoco', state: 'Estado de México' },
  { name: 'Nezahualcóyotl', state: 'Estado de México' },
  { name: 'Nicolás Romero', state: 'Estado de México' },

  // Guanajuato
  { name: 'Guanajuato', state: 'Guanajuato' },
  { name: 'León', state: 'Guanajuato' },
  { name: 'Irapuato', state: 'Guanajuato' },
  { name: 'Celaya', state: 'Guanajuato' },
  { name: 'Salamanca', state: 'Guanajuato' },
  { name: 'San Miguel de Allende', state: 'Guanajuato' },
  { name: 'Silao', state: 'Guanajuato' },

  // Guerrero
  { name: 'Chilpancingo', state: 'Guerrero' },
  { name: 'Acapulco', state: 'Guerrero' },
  { name: 'Zihuatanejo', state: 'Guerrero' },
  { name: 'Taxco', state: 'Guerrero' },

  // Hidalgo
  { name: 'Pachuca', state: 'Hidalgo' },
  { name: 'Tulancingo', state: 'Hidalgo' },
  { name: 'Tula de Allende', state: 'Hidalgo' },

  // Jalisco
  { name: 'Guadalajara', state: 'Jalisco' },
  { name: 'Zapopan', state: 'Jalisco' },
  { name: 'Tlaquepaque', state: 'Jalisco' },
  { name: 'Tonalá', state: 'Jalisco' },
  { name: 'Puerto Vallarta', state: 'Jalisco' },
  { name: 'Lagos de Moreno', state: 'Jalisco' },

  // Michoacán
  { name: 'Morelia', state: 'Michoacán' },
  { name: 'Zamora', state: 'Michoacán' },
  { name: 'Uruapan', state: 'Michoacán' },
  { name: 'Lázaro Cárdenas', state: 'Michoacán' },

  // Morelos
  { name: 'Cuernavaca', state: 'Morelos' },
  { name: 'Jiutepec', state: 'Morelos' },
  { name: 'Cuautla', state: 'Morelos' },

  // Nayarit
  { name: 'Tepic', state: 'Nayarit' },
  { name: 'Bahía de Banderas', state: 'Nayarit' },

  // Nuevo León
  { name: 'Monterrey', state: 'Nuevo León' },
  { name: 'Guadalupe', state: 'Nuevo León' },
  { name: 'San Nicolás de los Garza', state: 'Nuevo León' },
  { name: 'Apodaca', state: 'Nuevo León' },
  { name: 'Santa Catarina', state: 'Nuevo León' },
  { name: 'San Pedro Garza García', state: 'Nuevo León' },
  { name: 'Escobedo', state: 'Nuevo León' },

  // Oaxaca
  { name: 'Oaxaca de Juárez', state: 'Oaxaca' },
  { name: 'Salina Cruz', state: 'Oaxaca' },
  { name: 'Juchitán', state: 'Oaxaca' },
  { name: 'Huatulco', state: 'Oaxaca' },

  // Puebla
  { name: 'Puebla', state: 'Puebla' },
  { name: 'Tehuacán', state: 'Puebla' },
  { name: 'San Andrés Cholula', state: 'Puebla' },
  { name: 'Atlixco', state: 'Puebla' },

  // Querétaro
  { name: 'Querétaro', state: 'Querétaro' },
  { name: 'San Juan del Río', state: 'Querétaro' },

  // Quintana Roo
  { name: 'Cancún', state: 'Quintana Roo' },
  { name: 'Playa del Carmen', state: 'Quintana Roo' },
  { name: 'Chetumal', state: 'Quintana Roo' },
  { name: 'Tulum', state: 'Quintana Roo' },
  { name: 'Cozumel', state: 'Quintana Roo' },
  { name: 'Isla Mujeres', state: 'Quintana Roo' },

  // San Luis Potosí
  { name: 'San Luis Potosí', state: 'San Luis Potosí' },
  { name: 'Ciudad Valles', state: 'San Luis Potosí' },
  { name: 'Matehuala', state: 'San Luis Potosí' },

  // Sinaloa
  { name: 'Culiacán', state: 'Sinaloa' },
  { name: 'Mazatlán', state: 'Sinaloa' },
  { name: 'Los Mochis', state: 'Sinaloa' },
  { name: 'Guasave', state: 'Sinaloa' },

  // Sonora
  { name: 'Hermosillo', state: 'Sonora' },
  { name: 'Ciudad Obregón', state: 'Sonora' },
  { name: 'Nogales', state: 'Sonora' },
  { name: 'Guaymas', state: 'Sonora' },
  { name: 'San Luis Río Colorado', state: 'Sonora' },

  // Tabasco
  { name: 'Villahermosa', state: 'Tabasco' },
  { name: 'Cárdenas', state: 'Tabasco' },

  // Tamaulipas
  { name: 'Tampico', state: 'Tamaulipas' },
  { name: 'Matamoros', state: 'Tamaulipas' },
  { name: 'Reynosa', state: 'Tamaulipas' },
  { name: 'Ciudad Victoria', state: 'Tamaulipas' },
  { name: 'Nuevo Laredo', state: 'Tamaulipas' },
  { name: 'Altamira', state: 'Tamaulipas' },

  // Tlaxcala
  { name: 'Tlaxcala', state: 'Tlaxcala' },
  { name: 'Apizaco', state: 'Tlaxcala' },

  // Veracruz
  { name: 'Veracruz', state: 'Veracruz' },
  { name: 'Xalapa', state: 'Veracruz' },
  { name: 'Coatzacoalcos', state: 'Veracruz' },
  { name: 'Córdoba', state: 'Veracruz' },
  { name: 'Orizaba', state: 'Veracruz' },
  { name: 'Poza Rica', state: 'Veracruz' },
  { name: 'Minatitlán', state: 'Veracruz' },

  // Yucatán
  { name: 'Mérida', state: 'Yucatán' },
  { name: 'Valladolid', state: 'Yucatán' },
  { name: 'Progreso', state: 'Yucatán' },

  // Zacatecas
  { name: 'Zacatecas', state: 'Zacatecas' },
  { name: 'Fresnillo', state: 'Zacatecas' },
];

export function filterCities(query: string): MexicanCity[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return CITIES_MX.filter(
    c =>
      c.name.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q),
  ).slice(0, 8);
}
