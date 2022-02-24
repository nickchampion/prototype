import axios from 'axios'

export const whatThreeWordsLookup: (three_words: string) => Promise<{ coordinates: number[]; country: string }> =
  async three_words => {
    const request_data = {
      url: 'https://api.what3words.com/v3/convert-to-coordinates',
      params: {
        key: '982U9T42',
        words: three_words,
        format: 'JSON'
      }
    }

    const axios_req = axios.getUri({ url: request_data.url, params: request_data.params })
    // check cache for req

    const three_words_res = await axios.get(request_data.url, { params: request_data.params })
    const three_words_data = three_words_res.data

    return {
      coordinates: [three_words_data.coordinates.lng, three_words_data.coordinates.lat],
      country: three_words_data.country
    }

    // Cache response
  }
