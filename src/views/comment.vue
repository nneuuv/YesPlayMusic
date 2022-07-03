<template>
  <transition name="slide-up">
    <div class="comment-page" :data-theme="theme">
      <div
        v-if="
          (settings.lyricsBackground === 'blur') |
            (settings.lyricsBackground === 'dynamic')
        "
        class="comment-background"
        :class="{
          'dynamic-background': settings.lyricsBackground === 'dynamic',
        }"
      >
        <div
          class="top-right"
          :style="{ backgroundImage: `url(${bgImageUrl})` }"
        />
        <div
          class="bottom-left"
          :style="{ backgroundImage: `url(${bgImageUrl})` }"
        />
      </div>
      <div
        v-if="settings.lyricsBackground === true"
        class="gradient-background"
        :style="{ background }"
      ></div>
      <div class="close-button" @click="toggleComment">
        <button>
          <svg-icon icon-class="arrow-down" />
        </button>
      </div>
      <div ref="commentBox" class="commentBox" @scroll="onScroll">
        <div class="commentInner">
          <div class="commentHeader">
            <div class="commentSingImg">
              <img :src="imageUrl" alt="" />
            </div>
            <div class="commentSingName">{{ currentTrack.name }}</div>
            <div class="commentSinger">{{ artist.name }}</div>
          </div>
          <CommentInput
            ref="CommentInput"
            style="margin-bottom: 20px"
            :tip="commentTip"
            @sumbit="sendComment"
          ></CommentInput>
          <div class="commentListBox">
            <div class="commentTypeChange">
              <div class="commentTypeTitle">评论区</div>
              <div class="commentTypeTab">
                <span
                  class="typeItem"
                  :class="{ active: sortType === 2 }"
                  @click="changeType(2)"
                  >热度</span
                >
                <span
                  class="typeItem"
                  :class="{ active: sortType === 3 }"
                  @click="changeType(3)"
                  >时间</span
                >
              </div>
            </div>
            <div class="commentList">
              <CommentItem
                v-for="item in commentList"
                :key="item.commentId"
                :root-id="item.commentId"
                :img="item.user.avatarUrl"
                :name="item.user.nickname"
                :time="item.time"
                :content="item.content"
                :reply-count="item.replyCount"
                :liked-count="item.likedCount"
                :reply-list="item.replyList"
                :be-replied="item.beReplied"
                :liked="item.liked"
                @load-reply="getReply(item, $event)"
                @click-good="good($event, item)"
                @reply="reply($event, item.commentId)"
              ></CommentItem>
            </div>
          </div>
          <div v-if="tip" class="tip">{{ tip }}</div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
// The lyrics page of Apple Music is so gorgeous, so I copy the design.
// Some of the codes are from https://github.com/sl1673495/vue-netease-music

import * as Vibrant from 'node-vibrant/dist/vibrant.worker.min.js';
import Color from 'color';
import { mapState, mapMutations, mapActions } from 'vuex';
import {
  getMusicComment,
  getMusicCommentFloor,
  likeMusicComment,
  musicComment,
} from '@/api/comment';
import CommentItem from '@/components/CommentItem.vue';
import NProgress from 'nprogress';
import CommentInput from '@/components/CommentInput.vue';

export default {
  name: 'Comment',
  components: {
    CommentItem,
    CommentInput,
  },
  data() {
    return {
      background: '',
      sortType: 3, // :按推荐排序, 1:按热度排序, 3:按时间排序
      pageNo: 1,
      commentList: [],
      totalPage: 1,
      loading: false,
      loadend: false,
      commentTip: '',
      requesting: false,
    };
  },
  computed: {
    ...mapState(['player', 'settings', 'showComment']),
    currentTrack() {
      return this.player.currentTrack;
    },
    imageUrl() {
      return this.player.currentTrack?.al?.picUrl + '?param=1024y1024';
    },
    bgImageUrl() {
      return this.player.currentTrack?.al?.picUrl + '?param=512y512';
    },
    artist() {
      return this.currentTrack?.ar
        ? this.currentTrack.ar[0]
        : { id: 0, name: 'unknown' };
    },
    album() {
      return this.currentTrack?.al || { id: 0, name: 'unknown' };
    },
    theme() {
      return this.settings.lyricsBackground === true ? 'dark' : 'auto';
    },
    tip() {
      return this.loading ? '正在加载...' : this.loadend ? '没有更多了~' : '';
    },
  },
  watch: {
    currentTrack() {
      this.getCoverColor();
    },
    showComment(show) {
      if (show) {
        this.reload();
        this.$store.commit('enableScrolling', false);
      } else {
        this.reset();
        this.$store.commit('enableScrolling', true);
      }
    },
  },
  created() {
    this.getMusicComment();
    this.getCoverColor();
  },
  methods: {
    ...mapMutations(['toggleComment']),
    ...mapActions(['likeATrack']),

    getCoverColor() {
      if (this.settings.lyricsBackground !== true) return;
      const cover = this.currentTrack.al?.picUrl + '?param=256y256';
      Vibrant.from(cover, { colorCount: 1 })
        .getPalette()
        .then(palette => {
          const originColor = Color.rgb(palette.DarkMuted._rgb);
          const color = originColor.darken(0.1).rgb().string();
          const color2 = originColor.lighten(0.28).rotate(-30).rgb().string();
          this.background = `linear-gradient(to top left, ${color}, ${color2})`;
        });
    },

    reset() {
      this.pageNo = 1;
      this.commentList = [];
      this.totalPage = 1;
      this.sortType = 3;
      this.loading = false;
    },

    reload() {
      this.pageNo = 1;
      this.commentList = [];
      this.totalPage = 1;
      this.getMusicComment();
    },

    async getMusicComment() {
      try {
        NProgress.start();
        let cursor =
          this.commentList.length > 0
            ? this.commentList[this.commentList.length - 1].time
            : '';
        let data = await getMusicComment({
          id: this.currentTrack.id,
          type: 0,
          sortType: this.sortType,
          pageNo: this.pageNo,
          pageSize: 20,
          cursor: this.sortType === 3 ? cursor : '',
        });
        this.commentList.push(
          ...(data.data.comments || []).map(item => {
            return {
              ...item,
              replyList: [],
            };
          })
        );
        this.totalPage = Math.ceil(data.data.totalCount / 20);
        this.loadend = this.pageNo >= this.totalPage;
        NProgress.done();
      } catch (e) {
        console.log(e);
      }
    },

    async getReply(item, time = '') {
      try {
        if (this.requesting) {
          return;
        }
        this.requesting = true;
        NProgress.start();
        let data = await getMusicCommentFloor({
          id: this.currentTrack.id,
          parentCommentId: item.commentId,
          type: 0,
          limit: 20,
          time,
        });
        item.replyList.push(...data.data.comments);
        NProgress.done();
        this.requesting = false;
      } catch (e) {
        console.log(e);
        this.requesting = false;
      }
    },

    async good(data, data2) {
      if (this.requesting) {
        return;
      }
      this.requesting = true;
      NProgress.start();
      let item = data || data2;
      try {
        let data = await likeMusicComment({
          id: this.currentTrack.id,
          cid: item.commentId,
          t: item.liked ? 0 : 1,
          type: 0,
        });
        if (!data) {
          this.toggleComment();
        } else {
          item.liked = !item.liked;
        }
        NProgress.done();
        this.requesting = false;
      } catch (e) {
        console.log(e);
        this.requesting = false;
      }
    },

    async onScroll() {
      if (this.loading || this.loadend || !this.showComment) {
        return;
      }
      this.loading = true;
      let el = this.$refs.commentBox;
      if (el.scrollTop >= el.scrollHeight - el.clientHeight - 50) {
        this.pageNo++;
        await this.getMusicComment();
      }
      this.loading = false;
    },

    changeType(type) {
      this.sortType = type;
      this.reload();
    },

    async sendComment(value, commentId = '') {
      try {
        if (!value || this.requesting) {
          return;
        }
        this.requesting = true;
        NProgress.start();
        await musicComment({
          t: commentId ? 2 : 1, // 1 发送, 2 回复
          type: 0,
          id: this.currentTrack.id,
          content: value,
          commentId, // 回复的评论 id (回复评论时必填)
        });
        this.commentTip = '评论成功，请等待审核通过';
        this.$refs.CommentInput.reset();
        this.reset();
        this.reload();
        NProgress.done();
        this.requesting = false;
      } catch (e) {
        console.log(e);
        this.requesting = false;
      }
    },

    reply({ content, commentId }, commentId2) {
      content = typeof content === 'string' ? content : content.content;
      commentId = commentId || commentId2;
      this.sendComment(content, commentId);
    },
  },
};
</script>

<style lang="scss" scoped>
.comment-page {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: 200;
  background: var(--color-body-bg);
  display: flex;
  clip: rect(auto, auto, auto, auto);
}

.comment-background {
  --contrast-lyrics-background: 75%;
  --brightness-lyrics-background: 150%;
}

[data-theme='dark'] .lyrics-background {
  --contrast-lyrics-background: 125%;
  --brightness-lyrics-background: 50%;
}

.comment-background {
  filter: blur(50px) contrast(var(--contrast-lyrics-background))
    brightness(var(--brightness-lyrics-background));
  position: absolute;
  height: 100vh;
  width: 100vw;
  .top-right,
  .bottom-left {
    z-index: 0;
    width: 140vw;
    height: 140vw;
    opacity: 0.6;
    position: absolute;
    background-size: cover;
  }

  .top-right {
    right: 0;
    top: 0;
    mix-blend-mode: luminosity;
  }

  .bottom-left {
    left: 0;
    bottom: 0;
    animation-direction: reverse;
    animation-delay: 10s;
  }
}

.dynamic-background > div {
  animation: rotate 150s linear infinite;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.gradient-background {
  position: absolute;
  height: 100vh;
  width: 100vw;
}

.close-button {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 300;
  border-radius: 0.75rem;
  height: 44px;
  width: 44px;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.28;
  transition: 0.2s;
  -webkit-app-region: no-drag;

  .svg-icon {
    color: var(--color-text);
    padding-top: 5px;
    height: 22px;
    width: 22px;
  }

  &:hover {
    background: var(--color-secondary-bg-for-transparent);
    opacity: 0.88;
  }
}

@media (max-aspect-ratio: 10/9) {
  .left-side {
    display: none;
  }
  .right-side .lyrics-container {
    max-width: 100%;
  }
}

@media screen and (min-width: 1200px) {
  .right-side .lyrics-container {
    max-width: 600px;
  }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s;
}

.slide-up-enter, .slide-up-leave-to /* .fade-leave-active below version 2.1.8 */ {
  transform: translateY(100%);
}

.slide-fade-enter-active {
  transition: all 0.5s ease;
}

.slide-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.2, 0.2, 0, 1);
}

.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(27vh);
  opacity: 0;
}

.commentBox {
  width: 100%;
  position: relative;
  padding: 20px 0;
  overflow: auto;

  .commentInner {
    width: 640px;
    margin: 0 auto;

    .commentHeader {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--color-text);
      .commentSingImg {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 15px;

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }

      .commentSingName {
        color: var(--color-text);
        margin-right: 10px;
      }

      .commentSinger {
        color: var(--color-text);
        font-size: 12px;
        opacity: 0.7;
      }
    }

    .commentListBox {
      .commentTypeChange {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
        color: var(--color-text);

        .commentTypeTitle {
        }

        .commentTypeTab {
          .typeItem {
            margin-right: 20px;
            opacity: 0.4;
            cursor: pointer;
            user-select: none;

            &:last-of-type {
              margin-right: 0;
            }

            &.active {
              opacity: 1;
            }
          }
        }
      }

      .commentList {
      }
    }

    .tip {
      height: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: var(--color-text);
    }
  }
}
</style>
