import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, name, type, image, url }) => {
    const siteName = 'DLCF South West Portal';
    const defaultDescription = 'Deeper Life Campus Fellowship South West Portal';
    const defaultImage = '/favicon.png'; // Or a better default OG image if available
    const currentUrl = url || window.location.href;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title ? `${title} | ${siteName}` : siteName}</title>
            <meta name='description' content={description || defaultDescription} />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />

            {/* Facebook tags */}
            <meta property="og:type" content={type || 'website'} />
            <meta property="og:title" content={title ? `${title} | ${siteName}` : siteName} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:image" content={image || defaultImage} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name || siteName} />
            <meta name="twitter:card" content={type === 'article' ? 'summary_large_image' : 'summary'} />
            <meta name="twitter:title" content={title ? `${title} | ${siteName}` : siteName} />
            <meta name="twitter:description" content={description || defaultDescription} />
            <meta name="twitter:image" content={image || defaultImage} />
        </Helmet>
    );
};

export default SEO;
