const proxyVideo = document.createElement('video');

export default proxyVideo;

class UserMediaStream {
  constructor() {
    this.userMediaStream = null;
  }

  setUserMediaStream = (stream) => {
    if (stream !== null) this.userMediaStream = stream;
  }

  getUserMediaStream = () => {
    return this.userMediaStream;
  }
}

export const mediaStreamProxy = new UserMediaStream();
