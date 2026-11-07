import { createImageUrlBuilder } from "@sanity/image-url";
import { sanityDataset, sanityProjectId } from "./config";
import type { SanityImage } from "./types";

const builder = createImageUrlBuilder({ projectId: sanityProjectId || "missing", dataset: sanityDataset });

/** CDN URL for a Sanity image, honouring the editor's crop and focus point. */
export function sanityImageUrl(image: SanityImage, width: number, height?: number) {
  let url = builder.image(image).width(width).auto("format").quality(80);
  if (height) url = url.height(height).fit("crop");
  return url.url();
}

/** Builds a srcSet so browsers download only the size they need. */
export function sanityImageSrcSet(image: SanityImage, widths: number[], aspect?: number) {
  return widths.map((width) => `${sanityImageUrl(image, width, aspect ? Math.round(width / aspect) : undefined)} ${width}w`).join(", ");
}

/** Natural dimensions are encoded in the asset id: image-<hash>-<width>x<height>-<ext>. */
export function sanityImageDimensions(image: SanityImage) {
  const match = /-(\d+)x(\d+)-/.exec(image.asset?._ref ?? "");
  return match ? { width: Number(match[1]), height: Number(match[2]) } : { width: 1600, height: 1000 };
}
