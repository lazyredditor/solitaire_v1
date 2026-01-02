'use client';

import React, { useEffect, useRef } from 'react';

// TODO: Replace with your actual AdSense values
// You can find these in your Google AdSense dashboard under "Ads" -> "By ad unit"
const ADSENSE_PUBLISHER_ID = 'ca-pub-1501335036243375';
const ADSENSE_SLOT_ID = '5855870369';

// Only show real ads in production to avoid invalid traffic/bans on localhost
// Change this logic if you want to test with real ads (use test/preview mode in AdSense instead)
const SHOW_ADS = process.env.NODE_ENV === 'production';

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

export function BannerPlaceholder() {
    const initialized = useRef(false);

    useEffect(() => {
        // Prevent double initialization
        if (initialized.current) return;
        if (!SHOW_ADS) return;

        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            initialized.current = true;
        } catch (err) {
            console.error('AdSense error:', err);
        }
    }, []);

    if (!SHOW_ADS) {
        return (
            <div className="ad-banner">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span className="ad-placeholder">Advertisement Space</span>
                    <span style={{ fontSize: '10px', marginTop: '4px', opacity: 0.5 }}>
                        (Ads appear here in production)
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="ad-banner" style={{ background: 'transparent', border: 'none', height: '90px', overflow: 'hidden' }}>
            <ins className="adsbygoogle"
                style={{ display: 'block', width: '100%', height: '100%' }}
                data-ad-client={ADSENSE_PUBLISHER_ID}
                data-ad-slot={ADSENSE_SLOT_ID}
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>
        </div>
    );
}
