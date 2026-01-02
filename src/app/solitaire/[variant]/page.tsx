import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllVariantSlugs, getVariant } from '@/lib/seo-variants';
import { GameContent } from '@/components/Content/GameContent';
import { BannerPlaceholder } from '@/components/Ad/BannerPlaceholder';
import { VariantGameWrapper } from '@/components/Game/VariantGameWrapper';

// Define the type for the dynamic params
type Props = {
    params: Promise<{ variant: string }>;
};

// Generate static params for all variants
export async function generateStaticParams() {
    const slugs = getAllVariantSlugs();
    return slugs.map((slug) => ({
        variant: slug,
    }));
}

// Generate metadata for each variant
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { variant } = await params;
    const data = getVariant(variant);

    if (!data) {
        return {
            title: 'Solitaire Variant Not Found',
        };
    }

    return {
        title: data.title,
        description: data.description,
        openGraph: {
            title: data.title,
            description: data.description,
            type: 'website',
            url: `https://solitaire.betterapp.org/solitaire/${variant}`,
        },
    };
}

export default async function VariantPage({ params }: Props) {
    const { variant } = await params;
    const data = getVariant(variant);

    if (!data) {
        notFound();
    }

    return (
        <div className="variant-page-wrapper">
            <VariantGameWrapper config={data.config}>
                <BannerPlaceholder />
                <GameContent
                    titleOverride={data.h1}
                    introOverride={data.content?.intro}
                    featuresOverride={data.content?.features}
                />
            </VariantGameWrapper>
        </div>
    );
}
