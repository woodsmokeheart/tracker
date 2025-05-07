import React from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ isOpen, onClose, imageUrl }) => {
  return (
    <Lightbox
      open={isOpen}
      close={onClose}
      slides={[{ src: imageUrl }]}
      plugins={[Zoom]}
      animation={{ fade: 300 }}
      carousel={{ finite: true }}
      render={{
        buttonPrev: () => null,
        buttonNext: () => null,
      }}
    />
  );
};

export default ImageLightbox; 