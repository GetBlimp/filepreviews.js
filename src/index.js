/* global ajax */

class FilePreviews {
  constructor(options) {
    const API_URL = 'https://api.filepreviews.io/v2';
    const opts = options || {};

    this.apiUrl = opts.apiUrl || API_URL;
    this.apiKey = opts.apiKey;
    this.debug = opts.debug || false;
    this._ajax = ajax;

    if (!opts.apiKey) {
      throw new Error('Missing required apiKey.');
    }

  }

  log(msg) {
    if (this.debug) {
      console.log(msg);
    }
  }

  generate(url, options, callback) {
    if (arguments.length === 2) {
      if (Object.prototype.toString.call(options) === '[object Function]') {
        callback = options;
      }
    } else if (arguments.length === 1) {
      options = {};
    }

    this.request(`${this.apiUrl}/previews/`, {
      method: 'POST',
      data: JSON.stringify(this.getAPIRequestData(url, options))
    }, (err, result) => {
      if (callback) {
        callback(err, result);
      }
    });
  }

  retrieve(previewId, callback) {
    this.request(`${this.apiUrl}/previews/${previewId}/`, {
      method: 'GET'
    }, (err, result) => {
      if (callback) {
        callback(err, result);
      }
    });
  }

  request(url, options, callback) {
    let data;
    const _options = options || {};

    const onSuccess = (response, xhr) => {
      this.log(`API request success: ${xhr.status} ${xhr.statusText}`);

      data = JSON.parse(response);
      this.log(`API request response: ${response}`);

      callback(null, data);
    };

    const onError = (status, message, xhr) => {
      try {
        data = JSON.parse(xhr.responseText);
      } catch (e) {
        data = xhr.responseText;
      }

      if (status === 201) {
        onSuccess(xhr.responseText, xhr);
      } else {
        this.log(`API request error: ${status}`);
        callback(data);
      }
    };

    const requestOptions = {
      headers: this.getAPIRequestHeaders(),
      method: _options.method || 'GET',
      success: onSuccess,
      error: onError
    };

    if (_options.data) {
      requestOptions.data = _options.data;
    }

    this.log(`API request to: ${url}`);

    this._ajax(url, requestOptions);
  }

  getAPIRequestHeaders() {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${btoa(this.apiKey)}:`
    };
  }

  getAPIRequestData(url, options) {
    let size;

    if (arguments.length === 2) {
      if (Object.prototype.toString.call(options) === '[object Function]') {
        options = {};
      }
    } else if (arguments.length === 1) {
      options = {};
    }

    if (options) {
      options.url = url;

      if (options.size) {
        size = '';

        if (options.size.width) {
          size = options.size.width;
        }

        if (options.size.height) {
          size = `${size}x${options.size.height}`;
        }

        options.sizes = [size];
      }
    }

    return options;
  }
}
