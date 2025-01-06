// src/App.js
import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
    const [startRoom, setStartRoom] = useState('');
    const [endRoom, setEndRoom] = useState('');
    const [route, setRoute] = useState([]);
    const [map, setMap] = useState([]);

    const findRoute = async () => {
        try {
            const response = await axios.post('http://localhost:8000/find_route', {
                start_room: startRoom,
                end_room: endRoom
            });
            setRoute(response.data.route);
        } catch (error) {
            console.error(error);
            alert('An error occurred while finding the route.');
        }
    };

    const fetchMap = async () => {
        try {
            const response = await axios.get('http://localhost:8000/print_map');
            setMap(response.data);
        } catch (error) {
            console.error(error);
            alert('An error occurred while fetching the map.');
        }
    };

    return (
        <div>
            <h1>Map Navigation</h1>
            <button onClick={fetchMap}>Fetch Map</button>
            <div>
                {map.map((floor, floorIdx) => (
                    <div key={floorIdx}>
                        <h2>Floor {floorIdx}</h2>
                        {floor.map((row, rowIdx) => (
                            <div key={rowIdx}>
                                {row.join(' ')}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div>
                <input
                    type="text"
                    placeholder="Start Room"
                    value={startRoom}
                    onChange={(e) => setStartRoom(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="End Room"
                    value={endRoom}
                    onChange={(e) => setEndRoom(e.target.value)}
                />
                <button onClick={findRoute}>Find Route</button>
            </div>
            <div>
                <h2>Route</h2>
                {route.length === 0 ? (
                    <p>No route found</p>
                ) : (
                    route.map((step, index) => (
                        <div key={index}>
                            {`Floor: ${step[0]}, X: ${step[1]}, Y: ${step[2]}`}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default App;
