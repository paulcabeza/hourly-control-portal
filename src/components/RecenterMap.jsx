import { useMap } from 'react-leaflet'
import { useEffect } from 'react'

const RecenterMap = ({ position }) => {
    const map = useMap()
    useEffect(() => {
        map.setView(position)
    }, [position])
    return null
}

export default RecenterMap