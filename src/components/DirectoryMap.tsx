import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { Link } from 'react-router-dom'
import type { Entrepreneur } from '@/types/database'
import 'leaflet/dist/leaflet.css'

// Ícone do Leaflet via CDN (evita problemas de empacotamento de imagens do Vite)
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface Props {
  entrepreneurs: Entrepreneur[]
}

export function DirectoryMap({ entrepreneurs }: Props) {
  const withCoords = entrepreneurs.filter(
    (e): e is Entrepreneur & { latitude: number; longitude: number } =>
      e.latitude != null && e.longitude != null
  )

  if (withCoords.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ink-700 py-16 text-center text-sand">
        Nenhum empreendedor com localização cadastrada no mapa ainda.
      </div>
    )
  }

  // Centraliza no ponto médio dos empreendedores encontrados
  const centerLat = withCoords.reduce((sum, e) => sum + e.latitude, 0) / withCoords.length
  const centerLng = withCoords.reduce((sum, e) => sum + e.longitude, 0) / withCoords.length

  return (
    <div className="h-[480px] w-full overflow-hidden rounded-lg border border-ink-700">
      <MapContainer center={[centerLat, centerLng]} zoom={11} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.map((e) => (
          <Marker key={e.id} position={[e.latitude, e.longitude]} icon={markerIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{e.business_name}</p>
                {e.city && <p className="text-xs text-gray-600">{e.city}</p>}
                <Link to={`/empreendedores/${e.slug}`} className="text-xs text-blue-600 underline">
                  Ver perfil
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
