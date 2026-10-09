import type { ImgHTMLAttributes } from 'react';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> & {
  name: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  sizes?: string;
};

export function Img({ name, alt, width, height, priority, sizes = '100vw', ...rest }: Props) {
  const set = (ext: string) => `/img/${name}-800.${ext} 800w, /img/${name}-1600.${ext} 1600w`;
  return (
    <picture>
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img
        src={`/img/${name}-1600.jpg`}
        srcSet={set('jpg')}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : undefined}
        {...rest}
      />
    </picture>
  );
}
