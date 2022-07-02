<template>
  <div class="commentItem" @click="showReply = true">
    <div class="avatarBox">
      <img :src="img" alt="" />
    </div>
    <div class="infoBox">
      <div class="userName">{{ name }}</div>
      <div class="time">{{ formatTime(time) }}</div>
      <div class="content">{{ content }}</div>
      <!-- 回复数量 -->
      <div
        v-if="replyCount > 0 && replyList.length <= 0"
        class="replyCount"
        @click.stop="loadReply"
        >{{ replyCount }}条回复 &gt;</div
      >
      <!-- 回复列表 -->
      <div v-if="replyList.length > 0" class="replyList">
        <CommentItem
          v-for="item in replyList"
          :key="item.commentId"
          :root-id="rootId"
          :img="item.user.avatarUrl"
          :name="item.user.nickname"
          :time="item.time"
          :content="item.content"
          :reply-count="item.replyCount"
          :liked-count="item.likedCount"
          :reply-list="item.replyList"
          :be-replied="item.beReplied"
          :liked="item.liked"
          @click-good="
            () => {
              $emit('click-good', item);
            }
          "
          @reply="
            $event => {
              $emit('reply', {
                content: $event,
                commentId: item.commentId,
              });
            }
          "
        ></CommentItem>
        <!-- 回复加载更多 -->
        <div
          v-if="replyList.length < replyCount"
          class="loadMoreBtn"
          @click.stop="loadReply"
          >加载更多</div
        >
      </div>
      <!-- 被回复的评论 -->
      <div
        v-if="
          beReplied &&
          beReplied.length > 0 &&
          beReplied[0].beRepliedCommentId !== rootId
        "
        class="beReplied"
      >
        <span class="beRepliedName">{{ beReplied[0].user.nickname }}</span>
        <span class="beRepliedContent">:{{ beReplied[0].content }}</span>
      </div>
      <!-- 回复评论 -->
      <CommentInput
        v-if="showReply"
        ref="CommentInput"
        style="margin-top: 20px"
        :placeholder="'回复' + name + ':'"
        @sumbit="
          $event => {
            $emit('reply', {
              content: $event,
            });
          }
        "
      ></CommentInput>
    </div>
    <div class="goodBox">
      <span v-if="likedCount > 0" class="goodNum">{{ likedCount }}</span>
      <div class="goodBtn" @click.stop="$emit('click-good')">
        <svg-icon v-if="liked" icon-class="good-fill" />
        <svg-icon v-else icon-class="good" />
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs';
import CommentInput from '@/components/CommentInput.vue';

export default {
  name: 'CommentItem',
  components: {
    CommentInput,
  },
  props: {
    rootId: {
      type: [String, Number],
      default: '',
    },
    img: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      default: '',
    },
    time: {
      type: [String, Number],
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    replyCount: {
      type: [String, Number],
      default: '',
    },
    likedCount: {
      type: [String, Number],
      default: '',
    },
    replyList: {
      type: Array,
      default() {
        return [];
      },
    },
    beReplied: {
      type: Array,
      default() {
        return [];
      },
    },
    liked: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showReply: false,
    };
  },
  methods: {
    formatTime(time) {
      return dayjs(time).format('YYYY/MM/DD HH:mm:ss');
    },

    loadReply() {
      this.$emit(
        'load-reply',
        this.replyList.length
          ? this.replyList[this.replyList.length - 1].time
          : ''
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.commentItem {
  display: flex;
  margin-bottom: 20px;
  cursor: pointer;

  .avatarBox {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    margin-right: 10px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .infoBox {
    color: var(--color-text);
    flex-grow: 1;
    .userName {
      font-size: 14px;
    }

    .time {
      font-size: 12px;
      opacity: 0.5;
    }

    .content {
      margin-top: 15px;
      word-break: break-all;
    }

    .replyList {
      padding-top: 20px;

      .loadMoreBtn {
        color: #409eff;
        font-size: 12px;
        cursor: pointer;
      }
    }

    .replyCount {
      color: #409eff;
      font-size: 12px;
      margin-top: 5px;
      cursor: pointer;
    }

    .beReplied {
      margin-top: 15px;
      border-left: 1px solid var(--color-text);
      padding-left: 10px;

      .beRepliedName {
        color: #409eff;
      }

      .beRepliedContent {
        color: var(--color-text);
      }
    }
  }

  .goodBox {
    color: var(--color-text);
    display: flex;
    overflow: hidden;
    flex-shrink: 0;
    margin-left: 10px;

    .goodBtn {
      margin-left: 5px;
      cursor: pointer;
      .svg-icon {
        color: var(--color-text);
        height: 16px;
        width: 16px;
      }
    }
  }
}
</style>
