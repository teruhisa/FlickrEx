/// <reference path="../../typings/jquery.d.ts" />
/// <reference path="../flickrex/flickrex" />

module com.drikin.ExifEx {
    declare var window: any;

    var flickrex = new com.drikin.FlickrEx.Base();
    var exif_format = "%camera% %Focal Length% f/%aperture% ISO %ISO Speed% %Exposure% sec";
    var exif_jquery_selector = 'img';

    if (window.FLICKREX_EXIF_FORMAT !== undefined) {
        exif_format = window.FLICKREX_EXIF_FORMAT;
        delete window.FLICKREX_EXIF_FORMAT;
    }

    if (window.FLICKREX_EXIF_JQUERY_SELECTOR !== undefined) {
        exif_jquery_selector = window.FLICKREX_EXIF_JQUERY_SELECTOR;
        delete window.FLICKREX_EXIF_JQUERY_SELECTOR;
    }

    function makeExifString(exif_data: any): string {
        var exif_params = exif_format.match(/%[\w ]*%/ig);
        var exif = exif_data.photo.exif;

        var output_string = exif_format;
        for (var pi = 0, pl = exif_params.length; pi < pl; pi++) {
            var label = exif_params[pi].replace(/%/g, '');
            for (var ei = 0, el = exif.length; ei < el; ei++) {
                if (label.toLowerCase() === 'camera') {
                    if (exif_data.photo.camera) {
                        output_string = output_string.replace('%' + label + '%', exif_data.photo.camera);
                    }
                }
                if (label.toLowerCase() === exif[ei].label.toLowerCase()) {
                    output_string = output_string.replace('%' + label + '%', exif[ei].raw._content);
                }
            }
        }
        // clear Exif info if it is empty
        if (output_string === exif_format) {
            output_string = null;
        }
        // replace non exsisting Exif infos
        output_string = output_string.replace(/%[\w ]*%/ig, '-');
        return output_string;
    }

    // start from here
    $(document).ready(() => {
        var flickr_imgs = flickrex.getAllFlickrImageObjects(exif_jquery_selector);

        for (var i = 0, l = flickr_imgs.length; i < l; i++) {
            (function(){
                var flickr_img = flickr_imgs[i];
                flickrex.getExif(flickr_imgs[i].id, (exif_data) => {
                    var exif_string = makeExifString(exif_data);
                    if (exif_string) {
                        var p = $("<div class='flickr-exif'>" + exif_string + "</div>");
                        $(flickr_img.node).after(p);
                    }
                });
            })();
        }
    });
}
