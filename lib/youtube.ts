export function getYoutubeVideoId(url: string) {
  if (!url) return null;
  let videoId: string | null = null;

  if (url.includes('/shorts/')) {
    const parts = url.split('/shorts/');
    if (parts[1]) {
      videoId = parts[1].split(/[?&#]/)[0];
    }
  } else {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    }
  }

  if (videoId && videoId.length === 11) {
    return videoId;
  }
  return null;
}

export function getYoutubeEmbedUrl(url: string) {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1&loop=1&playlist=${videoId}&controls=0&rel=0&showinfo=0&iv_load_policy=3`;
}

export function isYoutubeUrl(url: string) {
  return !!getYoutubeVideoId(url);
}
