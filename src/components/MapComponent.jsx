import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import RecenterMap from './RecenterMap'

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:  'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl:        'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl:      'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
  });

const MapComponent = () => {
    const [position, setPosition] = useState([32.7767, -96.7970]); // Dallas, TX

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((pos) => {
            setPosition([pos.coords.latitude, pos.coords.longitude])
        })
    }, [])

    return (
        <MapContainer 
        center={position} 
        zoom={16} 
        className='h-[300px] w-full rounded shadow'
        >
            <RecenterMap position={position} />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
                <Popup>You are here</Popup>
            </Marker>
        </MapContainer>
    )

}

export default MapComponent;