import React, { useState } from 'react';

export default function CardSelector({ onSubmit }){
    const [holeCards, setHoleCards]= useState(["",""]);
    const [communityCards, setCommunityCards]= useState(["", "", "", "", ""]);

    const handleSubmit= ()=> {
        onSubmit(holeCards.filter(Boolean), communityCards.filter(Boolean));
    };

    return(
        <div>
            <h3>Select Cards</h3>
            <div>
                <label>Hole Cards:</label>
                {holeCards.map((cards,i)=>(
                    <input
                    key={i}
                    placeholder="e.g. AH"
                    value={cards}
                    onChange={(e)=> {
                        const copy = [...holeCards]
                        copy[i]=e.target.value.toUpperCase();
                        setHoleCards(copy);
                    }}
                />
                ))}
            </div>
            <div>
                <label>Community Cards:</label>
                {communityCards.map((card,i)=>(
                    <input
                    key={i}
                    placeholder='e.g. 10H'
                    value={card}
                    onChange={(e)=>{
                        const copy = [...communityCards];
                        copy[i]=e.target.value.toUpperCase();
                        setCommunityCards(copy);

                    }}
                />
                ))}
            </div>
            <button onClick={handleSubmit}>Show Probabilities</button>
        </div>
    );

}