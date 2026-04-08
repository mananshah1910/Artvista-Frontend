import React, { createContext, useContext, useState, useEffect } from 'react';

const GalleryContext = createContext();

export const GalleryProvider = ({ children }) => {
    const [artworks, setArtworks] = useState([]);
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('art_gallery_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const [exhibitions, setExhibitions] = useState([]);

    useEffect(() => {
        const fetchGalleryData = async () => {
            try {
                const artRes = await fetch('http://localhost:8080/api/artworks');
                const arts = await artRes.json();
                setArtworks(arts);
            } catch (err) { console.error(err); }

            try {
                const exhRes = await fetch('http://localhost:8080/api/exhibitions');
                const exhs = await exhRes.json();
                setExhibitions(exhs);
            } catch (err) { console.error(err); }
        };
        fetchGalleryData();
    }, []);

    useEffect(() => {
        localStorage.setItem('art_gallery_cart', JSON.stringify(cart));
    }, [cart]);

    const addArtwork = async (artwork) => {
        try {
            const res = await fetch('http://localhost:8080/api/artworks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(artwork)
            });
            const newArt = await res.json();
            setArtworks([...artworks, newArt]);
        } catch (err) { console.error(err); }
    };

    const approveArtwork = async (id) => {
        try {
            const res = await fetch(`http://localhost:8080/api/artworks/${id}/approve`, {
                method: 'PUT'
            });
            const updated = await res.json();
            setArtworks(artworks.map(art => art.id === id ? updated : art));
        } catch (err) { console.error(err); }
    };

    const addToCart = (artwork) => {
        setCart([...cart, artwork]);
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const clearCart = () => {
        setCart([]);
    };

    const addExhibition = async (exhibition) => {
        try {
            const res = await fetch('http://localhost:8080/api/exhibitions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(exhibition)
            });
            const newExh = await res.json();
            setExhibitions([...exhibitions, newExh]);
        } catch (err) { console.error(err); }
    };

    return (
        <GalleryContext.Provider value={{
            artworks,
            addArtwork,
            approveArtwork,
            cart,
            addToCart,
            removeFromCart,
            clearCart,
            exhibitions,
            setExhibitions,
            addExhibition
        }}>
            {children}
        </GalleryContext.Provider>
    );
};

export const useGallery = () => useContext(GalleryContext);
