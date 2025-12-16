import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-blue-600 p-4 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">🏢 AdminCondominio</h1>
        <div className="space-x-4">
          {/* Estos links cambian la URL instantáneamente */}
          <Link to="/" className="hover:text-blue-200">Inicio</Link>
          <Link to="/residentes" className="hover:text-blue-200">Residentes</Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar