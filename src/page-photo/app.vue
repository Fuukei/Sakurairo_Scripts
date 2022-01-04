<template>
  <div class="container-siroi">
    <template v-if="showError === false">
      <siroi
        v-for="img in imgs"
        v-bind:data-image="img.img"
        v-bind:key="img.img"
        v-bind:vertical="
          (function () {
            if (img.vertical == null || img.vertical === true) {
              return true;
            } else {
              return false;
            }
          })()
        "
      >
        <h1>{{ img.header }}</h1>
        <p>{{ img.info }}</p>
      </siroi>
    </template>
    <template v-if="showError">
      <div>
        <h1>未上传图片或图片设置异常</h1>
        <p>请在模板页设置如下类似如下格式的 img 标签,支持本地上传和外部引入</p>
        <p>
          如下代码会被渲染成
          <a href="https://www.siroi.top/photo/" target="_blank">展示页</a>
        </p>
        <pre>
        &lt;src="https://www.wahaotu.com/uploads/allimg/202010/1602912171649821.jpg" alt="" data-header="标题" data-info="信息" &gt;
        &lt;img src="https://www.wahaotu.com/uploads/allimg/202010/1602912171649821.jpg" alt="" &gt;
        &lt;img src="https://www.wahaotu.com/uploads/allimg/202010/1602912171649821.jpg" alt="" data-info="信息" &gt;
        &lt;img src="https://www.wahaotu.com/uploads/allimg/202010/1602912171649821.jpg" alt="" vertical=false data-info="信息" &gt;
        &lt;img src="https://www.wahaotu.com/uploads/allimg/202010/1602912171649821.jpg" alt="" vertical=false data-header="标题" data-info="信息" &gt;
            </pre>
        <ol>
          img 参数说明
          <li>data-header:标题</li>
          <li>data-info:内容</li>
          <li>vertical:是否竖向排列(默认竖向即vertical=true)</li>
        </ol>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  async mounted() {
    const resp = await fetch(
      "/wp-admin/admin-ajax.php?action=getPhoto&post=" + this.$data.id
    );
    try {
      if (resp.ok) {
        const { imgs, code } = await resp.json();
        if (code == 200) {
          this.imgs = imgs;
          this.showError = imgs.length <= 0;
        } else {
          console.error(code);
        }
      } else {
        console.error("HTTP " + resp.status);
      }
    } catch (e) {
      console.error(e);
    }
  },
};
</script>
<style>
.container-siroi {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.siroi {
  position: relative;
  /* flex: 0 0 240px;
        width: 240px;
        height: 320px; */
  background-color: #333;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.66) 0 30px 60px 0, inset #333 0 0 0 5px,
    inset rgba(255, 255, 255, 0.5) 0 0 0 6px;
  transition: 1s cubic-bezier(0.445, 0.05, 0.55, 0.95);
}

.siroi-bg {
  opacity: 0.5;
  position: absolute;
  top: -20px;
  left: -20px;
  width: 100%;
  height: 100%;
  padding: 20px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  transition: 1s cubic-bezier(0.445, 0.05, 0.55, 0.95),
    opacity 5s 1s cubic-bezier(0.445, 0.05, 0.55, 0.95);
  pointer-events: none;
}

.siroi-info {
  padding: 20px;
  position: absolute;
  bottom: 0;
  color: #fff;
  transform: translateY(40%);
  transition: 0.6s 1.6s cubic-bezier(0.215, 0.61, 0.355, 1);
}

.siroi-info p {
  opacity: 0;
  text-shadow: black 0 2px 3px;
  transition: 0.6s 1.6s cubic-bezier(0.215, 0.61, 0.355, 1);
}

.siroi-info * {
  position: relative;
  z-index: 1;
}

.siroi-info:after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.6) 100%
  );
  background-blend-mode: overlay;
  opacity: 0;
  transform: translateY(100%);
  transition: 5s 1s cubic-bezier(0.445, 0.05, 0.55, 0.95);
}

.siroi-info h1 {
  font-family: "Playfair Display";
  font-size: 36px;
  font-weight: 700;
  text-shadow: rgba(0, 0, 0, 0.5) 0 10px 10px;
}
</style>