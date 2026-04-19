export interface VenezuelaState {
  name: string;
  municipalities: string[];
}

export const VENEZUELA_STATES: VenezuelaState[] = [
  {
    name: 'Amazonas',
    municipalities: ['Alto Orinoco', 'Atabapo', 'Atures', 'Autana', 'Manapiare', 'Maroa', 'Río Negro'],
  },
  {
    name: 'Anzoátegui',
    municipalities: [
      'Anaco', 'Aragua', 'Bolívar', 'Bruzual', 'Cajigal', 'Carvajal', 'Diego Bautista Urbaneja',
      'Freites', 'Guanipa', 'Guanta', 'Independencia', 'Libertad', 'McGregor', 'Miranda',
      'Monagas', 'Peñalver', 'Piritu', 'San Juan de Capistrano', 'Santa Ana', 'Simón Rodríguez',
      'Sotillo', 'Turístico Diego Bautista Urbaneja',
    ],
  },
  {
    name: 'Apure',
    municipalities: ['Achaguas', 'Biruaca', 'Muñoz', 'Páez', 'Pedro Camejo', 'Rómulo Gallegos', 'San Fernando'],
  },
  {
    name: 'Aragua',
    municipalities: [
      'Bolívar', 'Camatagua', 'Francisco Linares Alcántara', 'Girardot', 'José Ángel Lamas',
      'José Félix Ribas', 'José Rafael Revenga', 'Libertador', 'Mario Briceño Iragorry',
      'Ocumare de la Costa de Oro', 'San Casimiro', 'San Sebastián', 'Santiago Mariño',
      'Santos Michelena', 'Sucre', 'Tovar', 'Urdaneta', 'Zamora',
    ],
  },
  {
    name: 'Barinas',
    municipalities: [
      'Alberto Arvelo Torrealba', 'Antonio José de Sucre', 'Arismendi', 'Barinas',
      'Bolívar', 'Cruz Paredes', 'Ezequiel Zamora', 'Obispos', 'Pedraza', 'Rojas', 'Sosa',
    ],
  },
  {
    name: 'Bolívar',
    municipalities: [
      'Angostura del Orinoco', 'Caroní', 'Cedeño', 'El Callao', 'Gran Sabana',
      'Heres', 'Independencia', 'Piar', 'Raúl Leoni', 'Roscio', 'Sifontes', 'Sucre',
    ],
  },
  {
    name: 'Carabobo',
    municipalities: [
      'Bejuma', 'Carlos Arvelo', 'Diego Ibarra', 'Guacara', 'Juan José Mora',
      'Libertador', 'Los Guayos', 'Miranda', 'Montalbán', 'Naguanagua', 'Puerto Cabello',
      'San Diego', 'San Joaquín', 'Valencia',
    ],
  },
  {
    name: 'Cojedes',
    municipalities: [
      'Anzoátegui', 'Ezequiel Zamora', 'Girardot', 'Lima Blanco', 'Pao de San Juan Bautista',
      'Ricaurte', 'Rómulo Gallegos', 'San Carlos', 'Tinaco',
    ],
  },
  {
    name: 'Delta Amacuro',
    municipalities: ['Antonio Díaz', 'Casacoima', 'Pedernales', 'Tucupita'],
  },
  {
    name: 'Dependencias Federales',
    municipalities: ['Dependencias Federales'],
  },
  {
    name: 'Distrito Capital',
    municipalities: ['Libertador'],
  },
  {
    name: 'Falcón',
    municipalities: [
      'Acosta', 'Bolívar', 'Buchivacoa', 'Carirubana', 'Colina', 'Dabajuro', 'Democracia',
      'Falcón', 'Federación', 'Jacura', 'Los Taques', 'Mauroa', 'Miranda', 'Monseñor Iturriza',
      'Palmasola', 'Petit', 'Piritu', 'San Francisco', 'Silva', 'Sucre', 'Tocópero',
      'Unión', 'Urumaco', 'Zamora',
    ],
  },
  {
    name: 'Guárico',
    municipalities: [
      'Camaguán', 'Chaguaramas', 'El Socorro', 'Francisco de Miranda', 'José Félix Ribas',
      'José Tadeo Monagas', 'Juan Germán Roscio', 'Juan José Rondón', 'Las Mercedes',
      'Leonardo Infante', 'Mellado', 'Ortiz', 'San Gerónimo de Guayabal', 'San Juan de los Morros',
      'Santa María de Ipire', 'Zaraza',
    ],
  },
  {
    name: 'La Guaira',
    municipalities: ['Vargas'],
  },
  {
    name: 'Lara',
    municipalities: [
      'Andrés Eloy Blanco', 'Crespo', 'Iribarren', 'Jiménez', 'Morán', 'Palavecino',
      'Simón Planas', 'Torres', 'Urdaneta',
    ],
  },
  {
    name: 'Mérida',
    municipalities: [
      'Alberto Adriani', 'Andrés Bello', 'Antonio Pinto Salinas', 'Aricagua', 'Arzobispo Chacón',
      'Campo Elías', 'Caracciolo Parra Olmedo', 'Cardenal Quintero', 'Guaraque', 'Julio César Salas',
      'Justo Briceño', 'Libertador', 'Miranda', 'Obispo Ramos de Lora', 'Padre Noguera',
      'Pueblo Llano', 'Rangel', 'Rivas Dávila', 'Santos Marquina', 'Sucre', 'Tovar',
      'Tulio Febres Cordero', 'Zea',
    ],
  },
  {
    name: 'Miranda',
    municipalities: [
      'Acevedo', 'Andrés Bello', 'Baruta', 'Brión', 'Buroz', 'Carrizal', 'Chacao',
      'Cristóbal Rojas', 'El Hatillo', 'Guaicaipuro', 'Independencia', 'Lander',
      'Los Salias', 'Páez', 'Paz Castillo', 'Pedro Gual', 'Plaza', 'Simón Bolívar',
      'Sucre', 'Urdaneta', 'Zamora',
    ],
  },
  {
    name: 'Monagas',
    municipalities: [
      'Acosta', 'Aguasay', 'Bolívar', 'Caripe', 'Cedeño', 'Ezequiel Zamora', 'Libertador',
      'Maturín', 'Piar', 'Punceres', 'Santa Bárbara', 'Sotillo', 'Uracoa',
    ],
  },
  {
    name: 'Nueva Esparta',
    municipalities: ['Antolín del Campo', 'Arismendi', 'Díaz', 'García', 'Gómez', 'Maneiro', 'Marcano', 'Mariño', 'Península de Macanao', 'Tubores', 'Villalba'],
  },
  {
    name: 'Portuguesa',
    municipalities: [
      'Agua Blanca', 'Araure', 'Esteller', 'Guanare', 'Guanarito', 'José Vicente de Unda',
      'Monseñor José Carrillo', 'Ospino', 'Páez', 'Papelón', 'San Genaro de Boconoíto',
      'San Rafael de Onoto', 'Santa Rosalía', 'Sucre', 'Turen',
    ],
  },
  {
    name: 'Sucre',
    municipalities: [
      'Andrés Eloy Blanco', 'Arismendi', 'Benítez', 'Bermúdez', 'Bolívar', 'Cajigal',
      'Cruz Salmerón Acosta', 'Libertador', 'Mariño', 'Mejías', 'Montes', 'Ribero',
      'Sucre', 'Valdez',
    ],
  },
  {
    name: 'Táchira',
    municipalities: [
      'Andrés Bello', 'Antonio Rómulo Costa', 'Ayacucho', 'Bolívar', 'Cárdenas',
      'Córdoba', 'Fernández Feo', 'Francisco de Miranda', 'García de Hevia', 'Guásimos',
      'Independencia', 'Jáuregui', 'José María Vargas', 'Junín', 'Libertad', 'Libertador',
      'Lobatera', 'Michelena', 'Panamericano', 'Pedro María Ureña', 'Rafael Urdaneta',
      'Samuel Darío Maldonado', 'San Cristóbal', 'San Judas Tadeo', 'Seboruco',
      'Simón Rodríguez', 'Sucre', 'Torbes', 'Uribante',
    ],
  },
  {
    name: 'Trujillo',
    municipalities: [
      'Andrés Bello', 'Boconó', 'Candelaria', 'Carache', 'Escuque', 'José Felipe Márquez Cañizales',
      'La Ceiba', 'Miranda', 'Monte Carmelo', 'Motatán', 'Pampán', 'Pampanito',
      'Rafael Rangel', 'Sucre', 'Trujillo', 'Urdaneta', 'Valera',
    ],
  },
  {
    name: 'Yaracuy',
    municipalities: [
      'Arístides Bastidas', 'Bolívar', 'Bruzual', 'Cocorote', 'Independencia', 'La Trinidad',
      'Nirgua', 'Páez', 'Peña', 'San Felipe', 'Sucre', 'Urachiche', 'Veroes',
    ],
  },
  {
    name: 'Zulia',
    municipalities: [
      'Almirante Padilla', 'Baralt', 'Cabimas', 'Catatumbo', 'Colón', 'Jesús Enrique Lossada',
      'Jesús María Semprún', 'La Cañada de Urdaneta', 'Lagunillas', 'Machiques de Perijá',
      'Mara', 'Maracaibo', 'Miranda', 'Páez', 'Rosario de Perijá', 'San Francisco',
      'Santa Rita', 'Simón Bolívar', 'Sucre', 'Valmore Rodríguez',
    ],
  },
];

export const VENEZUELA_STATE_NAMES: string[] = VENEZUELA_STATES.map((s) => s.name);

export function getMunicipalitiesForState(stateName: string): string[] {
  return VENEZUELA_STATES.find((s) => s.name === stateName)?.municipalities ?? [];
}
