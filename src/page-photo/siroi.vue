<template>
  <div
    class="siroi-wrap"
    @mousemove="handleMouseMove"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    ref="siroi"
  >
    <div class="siroi" :style="siroiStyle" ref="siroichild">
      <div class="siroi-bg" :style="[siroiBgTransform, siroiBgImage]"></div>
      <div class="siroi-info">
        <slot name="header"></slot>
        <slot name="content"></slot>
      </div>
    </div>
  </div>
</template>
    <script>
export default {
  props: ["dataImage", "vertical"],
  mounted() {
    if (this.vertical) {
      this.$refs.siroichild.style.width = "240px";
      this.$refs.siroichild.style.height = "320px";
    } else {
      this.$refs.siroichild.style.width = "320px";
      this.$refs.siroichild.style.height = "240px";
    }
    this.width = this.$refs.siroi.offsetWidth;
    this.height = this.$refs.siroi.offsetHeight;
  },
  data: () => ({
    width: 0,
    height: 0,
    mouseX: 0,
    mouseY: 0,
    mouseLeaveDelay: null,
  }),
  computed: {
    mousePX() {
      return this.mouseX / this.width;
    },
    mousePY() {
      return this.mouseY / this.height;
    },
    siroiStyle() {
      const rX = this.mousePX * 30;
      const rY = this.mousePY * -30;
      return {
        transform: `rotateY(${rX}deg) rotateX(${rY}deg)`,
      };
    },
    siroiBgTransform() {
      const tX = this.mousePX * -40;
      const tY = this.mousePY * -40;
      return {
        transform: `translateX(${tX}px) translateY(${tY}px)`,
      };
    },
    siroiBgImage() {
      if (this.vertical) {
        return {
          width: "280px",
          height: "360px",
          backgroundImage: `url(${this.dataImage})`,
        };
      } else {
        return {
          width: "360px",
          height: "280px",
          backgroundImage: `url(${this.dataImage})`,
        };
      }
    },
  },
  methods: {
    handleMouseMove(e) {
      this.mouseX = e.pageX - this.$refs.siroi.offsetLeft - this.width / 2;
      this.mouseY = e.pageY - this.$refs.siroi.offsetTop - this.height / 2;
    },
    handleMouseEnter() {
      clearTimeout(this.mouseLeaveDelay);
    },
    handleMouseLeave() {
      this.mouseLeaveDelay = setTimeout(() => {
        this.mouseX = 0;
        this.mouseY = 0;
      }, 1000);
    },
  },
};
</script>
<style>
.siroi-wrap {
  margin: 10px;
  transform: perspective(800px);
  transform-style: preserve-3d;
  cursor: pointer;
}

.siroi-wrap:hover .siroi-info {
  transform: translateY(0);
}

.siroi-wrap:hover .siroi-info p {
  opacity: 1;
}

.siroi-wrap:hover .siroi-info,
.siroi-wrap:hover .siroi-info p {
  transition: 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

.siroi-wrap:hover .siroi-info:after {
  transition: 5s cubic-bezier(0.23, 1, 0.32, 1);
  opacity: 1;
  transform: translateY(0);
}

.siroi-wrap:hover .siroi-bg {
  transition: 0.6s cubic-bezier(0.23, 1, 0.32, 1),
    opacity 5s cubic-bezier(0.23, 1, 0.32, 1);
  opacity: 0.8;
}

.siroi-wrap:hover .siroi {
  transition: 0.6s cubic-bezier(0.23, 1, 0.32, 1),
    box-shadow 2s cubic-bezier(0.23, 1, 0.32, 1);
  box-shadow: rgba(255, 255, 255, 0.2) 0 0 40px 5px, white 0 0 0 1px,
    rgba(0, 0, 0, 0.66) 0 30px 60px 0, inset #333 0 0 0 5px,
    inset white 0 0 0 6px;
}
</style>