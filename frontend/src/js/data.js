export const condominios = [
  {
    id: 1,
    nombre: 'Torres del Parque',
    direccion: 'Av. Principal #123',
    residentes: [
      {
        id: 1,
        nombre: 'Ana Pérez',
        telefono: '123456789',
        correo: 'ana@example.com'
      },
      {
        id: 2,
        nombre: 'Carlos Soto',
        telefono: '987654321',
        correo: 'carlos@example.com'
      }
    ],
    gastos: [
      {
        id: 1,
        concepto: 'Luz común',
        monto: 12000,
        pagado: true
      },
      {
        id: 2,
        concepto: 'Agua',
        monto: 8500,
        pagado: false
      }
    ]
  },
  {
    id: 2,
    nombre: 'Residencial Las Flores',
    direccion: 'Calle Secundaria #456',
    residentes: [],
    gastos: []
  }
];
