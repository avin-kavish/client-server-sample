import formatDistanceToNow from "https://unpkg.com/date-fns@2.28.0/esm/formatDistanceToNow";

async function loadComments() {
  const res = await fetch('http://localhost:3000/api/v1/comments')
  if (!res.ok) {

  }
  const { data } = await res.json()
  const commentContainer = document.querySelector('.comments__container')
  commentContainer.innerHTML = data.map(c => `
      <div class="comments__comment-container">
        <div class="comments__avatar">
          <img src="/images/avatar-bob.png" />
        </div>
        <div class="comments__comment-content-container">
          <div class="comments__comment-header">
            <div class="comments__comment-author">
              Rob Hope
            </div>
            <div class="comments__comment-header-separator">
              ・
            </div>
            <div class="comments__comment-time">
              ${formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
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
    `).join('')
}

loadComments()

