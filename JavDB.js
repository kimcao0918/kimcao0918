/*
JavDB 去广告
适配新版 API
Loon / Surge / Stash / QX
*/

let body = $response.body;

try {

  let obj = JSON.parse(body);

  // ===== 通用广告字段 =====

  const adKeys = [
    "ad",
    "ads",
    "advert",
    "advertisement",
    "banner",
    "banners",
    "popup",
    "launch",
    "startup",
    "splash",
    "promotion"
  ];

  function deepClean(target) {

    if (!target || typeof target !== "object") return;

    for (const key in target) {

      const lowerKey = key.toLowerCase();

      // 命中广告字段
      if (adKeys.includes(lowerKey)) {

        if (Array.isArray(target[key])) {
          target[key] = [];
        } else {
          target[key] = {};
        }

        continue;
      }

      // 首页广告卡片
      if (
        target[key]?.is_ad === true ||
        target[key]?.type === "ad" ||
        target[key]?.layout === "advert"
      ) {
        delete target[key];
        continue;
      }

      // 递归
      if (typeof target[key] === "object") {
        deepClean(target[key]);
      }
    }
  }

  deepClean(obj);

  // ===== 常见结构处理 =====

  if (Array.isArray(obj.data)) {
    obj.data = obj.data.filter(item => {
      return !(
        item?.is_ad ||
        item?.type === "ad"
      );
    });
  }

  // ===== 启动广告 =====

  if (obj?.data?.splash_ad) {
    obj.data.splash_ad = {};
  }

  // ===== banner =====

  if (obj?.data?.banner) {
    obj.data.banner = [];
  }

  // ===== popup =====

  if (obj?.data?.popup) {
    obj.data.popup = {};
  }

  // ===== 更新公告 =====

  if (obj?.data?.notice) {
    obj.data.notice = "";
  }

  body = JSON.stringify(obj);

} catch (e) {

  console.log("JavDB AdBlock Error: " + e);

}

$done({ body });