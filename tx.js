async function getLocalInfo() {
  return jsonify({
    ver: 1,
    name: "TXH测试版",
    api: "csp_txh_local"
  })
}

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X)'
const cheerio = createCheerio()

const appConfig = {
  ver: 1,
  title: 'TXH',
  site: 'https://tth.txh069.com',
  tabs: [
    {
      name: '手动输入',
      ui: 1,
      ext: {
        id: 'manual'
      }
    }
  ]
}

async function getConfig() {
  return jsonify(appConfig)
}

async function getCards(ext) {
  return jsonify({
    list: [
      {
        vod_id: '35138',
        vod_name: '测试视频',
        vod_pic: '',
        ext: {
          url: 'https://tth.txh069.com/movie/detail/35138'
        }
      }
    ]
  })
}

async function getTracks(ext) {
  ext = argsify(ext)

  const { data } = await $fetch.get(ext.url, {
    headers: {
      'User-Agent': UA,
      'Referer': 'https://tth.txh069.com'
    }
  })

  const match = data.match(
    /https:\/\/tth\.txh069\.com\/h5\/m3u8\/link\/.*?\.m3u8/
  )

  if (!match) {
    return jsonify({
      list: []
    })
  }

  return jsonify({
    list: [
      {
        title: 'TXH线路',
        tracks: [
          {
            name: '播放',
            ext: {
              url: match[0]
            }
          }
        ]
      }
    ]
  })
}

async function getPlayinfo(ext) {
  ext = argsify(ext)

  return jsonify({
    urls: [ext.url],
    headers: [
      {
        'User-Agent': UA,
        'Referer': 'https://tth.txh069.com'
      }
    ]
  })
}

async function search(ext) {
  ext = argsify(ext)

  const id = ext.text.match(/\d+/)

  if (!id) {
    return jsonify({ list: [] })
  }

  return jsonify({
    list: [
      {
        vod_id: id[0],
        vod_name: '搜索结果',
        ext: {
          url: `https://tth.txh069.com/movie/detail/${id[0]}`
        }
      }
    ]
  })
}