import formatDistanceToNow from "https://unpkg.com/date-fns@2.28.0/esm/formatDistanceToNow";
import {fetchJson} from "./utils.mjs";

async function loadComments() {
  const {data: comments} = await fetchJson('http://localhost:3000/api/v1/comments')

  const params = new URLSearchParams(comments.map(c => ['ids', c.userId]))
  const {data: users} = await fetchJson(`http://localhost:3000/api/v1/users?${params}`)

  const commentContainer = document.querySelector('.comments__container')
  commentContainer.innerHTML = comments.map(c => {
    const user = users.find(u => u.id === c.userId)

    return `
        <div class="comments__comment-container">
          <div>
            <div class="comments__avatar">
              <img class="comments__avatar-img" src="${user.avatar}" />
            </div>
          </div>
          <div class="comments__comment-content-container">
            <div class="comments__comment-header">
              <div class="comments__comment-author">
                ${user.name}
              </div>
              <div class="comments__comment-header-separator">
                ・
              </div>
              <div class="comments__comment-time">
                ${formatDistanceToNow(new Date(c.createdAt), {addSuffix: true})}
              </div>
            </div>
            <div class="comments__comment-content-body">
              ${c.body}
            </div>
            <div class="comments__comment-actions">
              <button class="button button-text upvote-button">
                ▲ Upvote
              </button>
  <!--            <button class="button button-text reply-button">-->
  <!--              Reply-->
  <!--            </button>-->
            </div>
          </div>
        </div>
      `;
  }).join('')
}

loadComments()

