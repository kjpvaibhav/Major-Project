import React, { useState } from 'react';
import axios from 'axios';
import './AppNav.css';

function NavigationPage() {
  const [startRoom, setStartRoom] = useState('');
  const [endRoom, setEndRoom] = useState('');
  const [route, setRoute] = useState(null);
  const [error, setError] = useState('');
  const [map, setMap] = useState([]);

  const findRoute = () => {
    const startPromise = fetch('http://localhost:8000/get_room_coordinates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ room_name: startRoom }),
    }).then((response) => response.json());
  
    const endPromise = fetch('http://localhost:8000/get_room_coordinates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ room_name: endRoom }),
    }).then((response) => response.json());
  
    Promise.all([startPromise, endPromise])
      .then(([startResponse, endResponse]) => {
        console.log('Start response:', startResponse);
        console.log('End response:', endResponse);
  
        return fetch('http://localhost:8000/find_route', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            start_room: startRoom,
            end_room: endRoom,
          }),
        });
      })
      .then((routeResponse) => {
        console.log('Route response:', routeResponse);
        return routeResponse.json();
      })
      .then((data) => {
        console.log('Route data:', data);
        setRoute(data.route);
        setError('');
      })
      .catch((err) => {
        console.error('Error in findRoute:', err);
        setError(err.response?.data?.detail || 'An error occurred in findRoute');
        setRoute(null);
      });
  };
  

  const getMap = async () => {
    try {
      const response = await axios.get('http://localhost:8000/print_map');
      setMap(response.data);
    } catch (err) {
      console.error('Error fetching map:', err);
    }
  };

  React.useEffect(() => {
    getMap();
  }, []);

  return (
    <div className="AppNav">
      <h1>Multi-Floor Map Navigation</h1>
      <div>
        <label>
          Start Room:
          <input type="text" value={startRoom} onChange={(e) => setStartRoom(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          End Room:
          <input type="text" value={endRoom} onChange={(e) => setEndRoom(e.target.value)} />
        </label>
      </div>
      <button onClick={findRoute}>Find Route</button>
      {error && <div className="error">{error}</div>}
      {route && (
        <div>
          <h2>Route:</h2>
          <ol>
            {route.map((step, index) => (
              <li key={index}>{`Floor ${step[0]}: (${step[1]}, ${step[2]})`}</li>
            ))}
          </ol>
        </div>
      )}
      <div>
        <h2>Map:</h2>
        {map.map((floor, floorIndex) => (
          <div key={floorIndex}>
            <h3>Floor {floorIndex}</h3>
            <pre>{JSON.stringify(floor, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NavigationPage;
