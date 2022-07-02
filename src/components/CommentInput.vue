<template>
  <div class="commentInputBox">
    <textarea
      v-model="value"
      class="commentInput"
      :placeholder="placeholder"
    ></textarea>
    <div class="commentFooter">
      <div class="commentTip">{{ tipText }}</div>
      <div class="sendBtn" @click="submit">发送</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommentInput',
  props: {
    tip: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '说点什么吧，也许TA都听得到',
    },
  },
  data() {
    return {
      value: '',
      tipText: '',
      timer: null,
    };
  },
  watch: {
    tip() {
      clearTimeout(this.timer);
      this.tipText = this.tip;
      this.timer = setTimeout(() => {
        this.tipText = '';
      }, 3000);
    },
  },
  methods: {
    submit() {
      this.$emit('sumbit', this.value.trim());
    },

    reset() {
      this.value = '';
    },
  },
};
</script>

<style lang="scss" scoped>
.commentInputBox {
  .commentInput {
    width: 100%;
    height: 100px;
    outline: none;
    background-color: transparent;
    margin-bottom: 10px;
    padding: 10px;
    box-sizing: border-box;
    color: var(--color-text);
    border: 1px solid var(--color-text);

    &::placeholder {
      color: var(--color-text);
    }
  }

  .commentFooter {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .commentTip {
      color: var(--color-text);
      font-size: 12px;
    }
    .sendBtn {
      width: 100px;
      height: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: var(--color-text);
      border: 1px solid var(--color-text);
      cursor: pointer;
      user-select: none;

      &:active {
        transform: translate(1px, 1px);
      }
    }
  }
}
</style>
