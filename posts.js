// =============================================
// وظائف المنشورات والتعليقات
// =============================================

class PostsManager {
    constructor(supabase, authManager) {
        this.supabase = supabase;
        this.authManager = authManager;
        this.allPosts = [];
        this.allComments = [];
    }

    // إنشاء منشور جديد
    async createPost(postData) {
        try {
            const currentUser = this.authManager.getCurrentUser();
            if (!currentUser) {
                return { success: false, error: 'يجب تسجيل الدخول أولاً' };
            }

            // التحقق من وجود نقاط كافية
            if (currentUser.points < 10) {
                return { success: false, error: 'ليس لديك نقاط كافية لنشر المنشور (المطلوب: 10 نقاط)' };
            }

            // إدخال المنشور في قاعدة البيانات
            const { data: postDataResult, error: postError } = await this.supabase
                .from('posts')
                .insert([postData])
                .select();
            
            if (postError) throw postError;

            // تحديث نقاط المستخدم وعدد المنشورات
            const newPoints = currentUser.points - 10;
            const newPostsCount = (currentUser.posts_count || 0) + 1;
            
            const { error: userError } = await this.supabase
                .from('users')
                .update({ 
                    points: newPoints,
                    posts_count: newPostsCount
                })
                .eq('user_id', currentUser.user_id);
            
            if (userError) throw userError;

            // تحديث بيانات المستخدم الحالي
            this.authManager.currentUser.points = newPoints;
            this.authManager.currentUser.posts_count = newPostsCount;
            localStorage.setItem('zawajni_current_user', JSON.stringify(this.authManager.currentUser));

            console.log('تم إنشاء المنشور بنجاح');
            return { success: true, data: postDataResult[0] };
        } catch (error) {
            console.error('خطأ في إنشاء المنشور:', error);
            return { success: false, error: error.message };
        }
    }

    // الحصول على جميع المنشورات
    async getAllPosts() {
        try {
            console.log('جاري جلب جميع المنشورات');
            
            const { data, error } = await this.supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            this.allPosts = data;
            console.log('تم جلب المنشورات:', data.length);
            return { success: true, data };
        } catch (error) {
            console.error('خطأ في جلب المنشورات:', error);
            return { success: false, error: error.message };
        }
    }

    // الإعجاب بمنشور
    async likePost(postId) {
        try {
            console.log('جاري الإعجاب بالمنشور:', postId);
            
            // الحصول على عدد الإعجابات الحالي
            const { data: post, error: postError } = await this.supabase
                .from('posts')
                .select('likes_count')
                .eq('post_id', postId)
                .single();
            
            if (postError) throw postError;

            // زيادة عدد الإعجابات
            const newLikes = (post.likes_count || 0) + 1;
            
            const { error: updateError } = await this.supabase
                .from('posts')
                .update({ likes_count: newLikes })
                .eq('post_id', postId);
            
            if (updateError) throw updateError;

            console.log('تم الإعجاب بالمنشور بنجاح');
            return { success: true, newLikes };
        } catch (error) {
            console.error('خطأ في الإعجاب بالمنشور:', error);
            return { success: false, error: error.message };
        }
    }

    // إضافة تعليق جديد
    async addComment(commentData) {
        try {
            console.log('جاري إضافة تعليق:', commentData);
            
            const { data, error } = await this.supabase
                .from('comments')
                .insert([commentData])
                .select();
            
            if (error) throw error;

            // تحديث عدد التعليقات في المنشور
            const { data: post, error: postError } = await this.supabase
                .from('posts')
                .select('comments_count')
                .eq('post_id', commentData.post_id)
                .single();
            
            if (postError) throw postError;

            const newCommentsCount = (post.comments_count || 0) + 1;
            
            const { error: updateError } = await this.supabase
                .from('posts')
                .update({ comments_count: newCommentsCount })
                .eq('post_id', commentData.post_id);
            
            if (updateError) throw updateError;

            console.log('تم إضافة التعليق بنجاح');
            return { success: true, data: data[0], newCommentsCount };
        } catch (error) {
            console.error('خطأ في إضافة التعليق:', error);
            return { success: false, error: error.message };
        }
    }

    // الحصول على تعليقات منشور معين
    async getPostComments(postId) {
        try {
            console.log('جاري جلب تعليقات المنشور:', postId);
            
            const { data, error } = await this.supabase
                .from('comments')
                .select('*')
                .eq('post_id', postId)
                .order('created_at', { ascending: true });
            
            if (error) throw error;
            
            console.log('تم جلب التعليقات:', data.length);
            return { success: true, data };
        } catch (error) {
            console.error('خطأ في جلب التعليقات:', error);
            return { success: false, error: error.message };
        }
    }

    // عرض المنشورات في الواجهة
    renderPosts(posts) {
        const postsList = document.getElementById('postsList');
        if (!postsList) return;
        
        postsList.innerHTML = '';
        
        posts.forEach(post => {
            const postElement = this.createPostElement(post);
            postsList.appendChild(postElement);
        });
    }

    // إنشاء عنصر منشور
    createPostElement(post) {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.setAttribute('data-post-id', post.post_id);
        
        postElement.innerHTML = `
            <div class="post-header">
                <div class="post-avatar">${post.username?.charAt(0) || 'U'}</div>
                <div class="post-user-info">
                    <div class="post-username">${post.username}</div>
                    <div class="post-meta">
                        <div class="post-time">
                            <i class="far fa-clock"></i>
                            ${Utils.formatDate(post.created_at)}
                        </div>
                    </div>
                </div>
            </div>
            <div class="post-content">${Utils.sanitizeText(post.content)}</div>
            <div class="post-stats">
                <div class="post-actions">
                    <div class="post-action like">
                        <i class="far fa-heart"></i>
                        <span class="post-likes">${post.likes_count || 0}</span>
                    </div>
                    <div class="post-action comment">
                        <i class="far fa-comment"></i>
                        <span class="post-comments-count">${post.comments_count || 0}</span>
                    </div>
                </div>
            </div>
            <div class="post-comments" id="comments-${post.post_id}"></div>
            <div class="post-comments-toggle" onclick="appManager.postsManager.toggleComments('${post.post_id}')">
                عرض التعليقات
            </div>
        `;
        
        // إضافة حدث الإعجاب
        const likeButton = postElement.querySelector('.post-action.like');
        likeButton.addEventListener('click', async () => {
            const result = await this.likePost(post.post_id);
            if (result.success) {
                const likesCount = postElement.querySelector('.post-likes');
                likesCount.textContent = result.newLikes;
            }
        });
        
        return postElement;
    }

    // تبديل عرض/إخفاء التعليقات
    async toggleComments(postId) {
        const commentsContainer = document.getElementById(`comments-${postId}`);
        const toggleButton = document.querySelector(`[onclick="appManager.postsManager.toggleComments('${postId}')"]`);
        
        if (!commentsContainer || !toggleButton) return;
        
        if (commentsContainer.style.display === 'none' || !commentsContainer.style.display) {
            // تحميل التعليقات
            const result = await this.getPostComments(postId);
            if (result.success) {
                this.renderComments(postId, result.data);
                if (this.authManager.getCurrentUser()) {
                    this.addCommentForm(postId);
                }
                commentsContainer.style.display = 'block';
                toggleButton.textContent = 'إخفاء التعليقات';
            }
        } else {
            commentsContainer.style.display = 'none';
            toggleButton.textContent = 'عرض التعليقات';
        }
    }

    // عرض التعليقات في المنشور
    renderComments(postId, comments) {
        const commentsContainer = document.getElementById(`comments-${postId}`);
        if (!commentsContainer) return;
        
        commentsContainer.innerHTML = '';
        
        comments.forEach(comment => {
            const commentElement = this.createCommentElement(comment);
            commentsContainer.appendChild(commentElement);
        });
    }

    // إنشاء عنصر تعليق
    createCommentElement(comment) {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        
        commentElement.innerHTML = `
            <div class="comment-avatar">${comment.username?.charAt(0) || 'U'}</div>
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-username">${comment.username}</span>
                    <span class="comment-time">${Utils.formatDate(comment.created_at)}</span>
                </div>
                <div class="comment-text">${Utils.sanitizeText(comment.content)}</div>
            </div>
        `;
        
        return commentElement;
    }

    // إضافة نموذج إدخال تعليق جديد
    addCommentForm(postId) {
        const commentsContainer = document.getElementById(`comments-${postId}`);
        if (!commentsContainer) return;
        
        const currentUser = this.authManager.getCurrentUser();
        if (!currentUser) return;
        
        const commentForm = document.createElement('div');
        commentForm.className = 'comment-form';
        
        commentForm.innerHTML = `
            <div class="comment-form-inner">
                <div class="user-avatar-small">${currentUser.username?.charAt(0) || 'U'}</div>
                <div class="comment-input-container">
                    <textarea 
                        id="comment-input-${postId}" 
                        placeholder="اكتب تعليقك..." 
                        class="comment-input"
                    ></textarea>
                    <button 
                        onclick="appManager.postsManager.submitComment('${postId}')"
                        class="comment-submit-btn"
                    >
                        إرسال التعليق
                    </button>
                </div>
            </div>
        `;
        
        commentsContainer.appendChild(commentForm);
    }

    // إرسال تعليق جديد
    async submitComment(postId) {
        const commentInput = document.getElementById(`comment-input-${postId}`);
        if (!commentInput || !commentInput.value.trim()) {
            Utils.showMessage('postMessage', 'يرجى كتابة التعليق', 'error');
            return;
        }
        
        const currentUser = this.authManager.getCurrentUser();
        if (!currentUser) return;
        
        const commentData = {
            comment_id: Utils.generateCommentId(),
            post_id: postId,
            user_id: currentUser.user_id,
            username: currentUser.username,
            content: commentInput.value.trim()
        };
        
        const result = await this.addComment(commentData);
        
        if (result.success) {
            commentInput.value = '';
            
            // تحديث عدد التعليقات في الواجهة
            const commentsCountElement = document.querySelector(`[data-post-id="${postId}"] .post-comments-count`);
            if (commentsCountElement) {
                commentsCountElement.textContent = result.newCommentsCount;
            }
            
            // إعادة تحميل التعليقات
            const commentsResult = await this.getPostComments(postId);
            if (commentsResult.success) {
                this.renderComments(postId, commentsResult.data);
                this.addCommentForm(postId);
            }
            
            Utils.showMessage('postMessage', 'تم إضافة التعليق بنجاح', 'success');
        } else {
            Utils.showMessage('postMessage', result.error, 'error');
        }
    }

    // معالجة نشر منشور جديد
    async handlePublishPost() {
        const postContent = document.getElementById('postContent');
        const publishBtn = document.getElementById('publishPostBtn');
        
        if (!postContent || !postContent.value.trim()) {
            Utils.showMessage('postMessage', 'يرجى كتابة محتوى المنشور', 'error');
            return;
        }
        
        if (postContent.value.length > 300) {
            Utils.showMessage('postMessage', 'المنشور لا يجب أن يتجاوز 300 حرف', 'error');
            return;
        }
        
        const originalText = Utils.showLoading(publishBtn);
        
        const currentUser = this.authManager.getCurrentUser();
        if (!currentUser) {
            Utils.hideLoading(publishBtn, originalText);
            return;
        }
        
        const postData = {
            post_id: Utils.generatePostId(),
            user_id: currentUser.user_id,
            username: currentUser.username,
            content: postContent.value.trim(),
            likes_count: 0,
            comments_count: 0,
            created_at: new Date().toISOString()
        };
        
        const result = await this.createPost(postData);
        
        if (result.success) {
            Utils.showMessage('postMessage', 'تم نشر المنشور بنجاح!', 'success');
            postContent.value = '';
            
            // إعادة تحميل المنشورات
            const postsResult = await this.getAllPosts();
            if (postsResult.success) {
                this.renderPosts(postsResult.data);
            }
        } else {
            Utils.showMessage('postMessage', result.error, 'error');
        }
        
        Utils.hideLoading(publishBtn, originalText);
    }
}