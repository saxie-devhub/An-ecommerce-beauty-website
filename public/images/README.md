# Product media

Put your product photos (`.jpg`, `.jpeg`, `.png`, or `.webp`) and short product videos (`.mp4`) in this folder.

For a single photo, the filename must match the product's `image` value in `../script.js`. For a single video, use its filename as `image` and add `mediaType: 'video'`.

To add any number of photos and videos to one product, replace its `image` line with a `media` list such as:

```js
media: [
  { file: 'hairbow.jpg', type: 'image' },
  { file: 'hairbow-closeup.jpg', type: 'image' },
  { file: 'hairbow-video.mp4', type: 'video' }
],
```

Customers can select **View media** on the product card to browse every file in that product's gallery.
