'use strict';

$(document).ready(function () {
    var config = {
            currentOffset: 0,
            email: 'foo@foo.com',
            getCommentsList: {
                method: 'GET',
                url: 'http://frontend-test.pingbull.com/pages/YOUR E-MAIL/comments',
                count: 5
            },
            editComment: {
                method: 'GET',
                url: 'http://frontend-test.pingbull.com/pages/YOUR E-MAIL/comments'
            },
            addComment: {
                method: 'POST',
                url: 'http://frontend-test.pingbull.com/pages/YOUR E-MAIL/comments'
            },
            deleteComment: {
                method: 'DELETE',
                url: 'http://frontend-test.pingbull.com/pages/YOUR E-MAIL/comments/COMMENT ID'
            }


        },
        replaceAll = function (str, mapObj) {
            var re = new RegExp(Object.keys(mapObj).join("|"), "gi");

            return str.replace(re, function (matched) {
                return mapObj[matched];
            });
        },
        composeCommentDate = function (date) {
            var t = new Date(date);

            var dd = t.getDate();
            var mm = t.getMonth() + 1; //January is 0!
            var yyyy = t.getFullYear();
            var hh = t.getHours();
            var min = t.getMinutes()

            return yyyy + '-' + mm + '-' + dd + '<span class="blog-at"> at </span>' + hh + ':' + min;
        },
        composeURL = function (url, email, commentID) {
            return replaceAll(url, {'YOUR E-MAIL': email, 'COMMENT ID': commentID});
        },
        incrementOffset = function (increment) {
            config.currentOffset += increment;

            return config.currentOffset;
        },
        decrementOffset = function (increment) {
            config.currentOffset -= increment;

            return config.currentOffset;
        },
        composeSubComments = function (subComments) {
            var subCommentsHTML = '';

            if (subComments) {
                subComments.length && subComments.forEach(function (subComment) {
                    subCommentsHTML += composeSubComment(subComment);
                });
            }


            return subCommentsHTML;
        },
        composeSubComment = function (subComment) {
            var author = subComment.author;

            return '<div class="sub-comment">\
                    <div class="sub-comment-avatar">\
                        <img src="' + author.avatar + '" class="sub-comment-logo">\
                    </div>\
                    \
                    <div class="sub-comment-comment">\
                        <span class="comment-author">' + author.name + '</span>\
                        <span class="retry-author">\
                            <i class="fa fa-share" aria-hidden="true"> ' + subComment.author.name + '</i>\
                        </span>\
                        \
                        <span class="comment-date">\
                            <i class="fa fa-clock-o" aria-hidden="true"></i>\
                           ' + composeCommentDate(author.updated_at) + '\
                        </span>\
                        \
                        <span class="comment-text">' + subComment.content + ' </span>\
                    </div>\
                </div>';
        },
        composeComments = function (comments) {
            var html = '';

            comments.forEach(function (comment) {
                html += composeComment(comment);
            });

            return html;
        },
        composeCommentBox = function (commentID) {
            return '<div class="comment-box">\
                    <div class="retry">\
                        <span class="retry-author"> <i class="fa fa-share" aria-hidden="true"> Kurt Thompson </i></span>\
                        <span class="cancel"> <i class="fa fa-times" aria-hidden="true"> Cancel </i></span>\
                    </div>\
                    <textarea class="comment-area" placeholder="Your Message"></textarea>\
                    <div class="send-comment">\
                    <button type="button" class="send-comment-button" data-id="' + commentID + '"> Send</button>\
                    </div>\
                 </div>';
        },
        composeComment = function (comment) {
            var author = comment.author;

            return '<div class="comment">\
                            <div class="avatar-container">\
                                <img src="' + author.avatar + '" class="avatar-image">\
                            </div>\
                                \
                            <div class="user-comment">\
                                <span class="comment-author">' + author.name + '</span>\
                                \
                                <span class="comment-date">\
                                    <i class="fa fa-clock-o" aria-hidden="true"></i>\
                                   ' + composeCommentDate(author.updated_at) + '\
                                </span>\
                                \
                                <span class="comment-text">' + comment.content + '</span>\
                                \
                                <div class="comments-actions">\
                                    <span class="comment-edit"> <i class="fa fa-pencil-square-o" aria-hidden="true"> Edit </i></span>\
                                    <span class="comment-delete" data-id="' + comment.id + '"> <i class="fa fa-times" aria-hidden="true"> Delete </i></span>\
                                    <span class="comment-reply" data-id="' + comment.id + '"> <i class="fa fa-reply" aria-hidden="true"> Reply </i></span>\
                                </div>\
                                \
                                ' + composeSubComments(comment.children) + '\
                            </div> \
                        </div>';
        },
        addCommentCallback = function () {
            addComment($(this));
        },
        replyCallback = function () {
            var $this = $(this),
                $commentsActions = $this.parents('.comments-actions');

            if (!$commentsActions.siblings('.comment-box').length) {
                var $commentBox = $(composeCommentBox($this.data('id')));

                $commentBox.insertAfter($commentsActions);

                $commentBox.find('.cancel').click(function () {
                    $commentBox.remove();
                });

                $commentBox.find('.send-comment-button').click(addCommentCallback);
            }
        },
        deleteCallback = function () {
            deleteComment($(this));
        },
        getCommentsList = function () {
            var getCommentsList = config.getCommentsList,
                count = getCommentsList.count;

            $.ajax({
                url: composeURL(getCommentsList.url, config.email),
                type: getCommentsList.method,
                data: {
                    count: count,
                    offset: getCommentsList.currentOffset
                },
                dataType: 'json'
            }).done(function (resp) {
                var commentsHtml = composeComments(resp);

                $(commentsHtml).appendTo($('.user-comments-container'));

                incrementOffset(count);

                $('.send-comment-button').click(addCommentCallback);

                $('.comment-delete').click(deleteCallback);

                $('.comment-reply').click(replyCallback);
            });
        },        
        addComment = function ($sendComment) {
            var content = $sendComment.parent().siblings('.comment-area').val(),
                parentID = $sendComment.data('id'),
                addComment = config.addComment,
                commentContainer = parentID
                    ? $sendComment.parents('.user-comment')
                    : $('.user-comments-container');


            $.ajax({
                url: composeURL(addComment.url, config.email),
                type: addComment.method,
                data: {
                    content: content,
                    parent: parentID
                }
            }).done(function (resp) {
                var $comment,
                    html = '';

                if (parentID) {
                    html = composeSubComment(resp);

                    $(html).appendTo(commentContainer);

                    commentContainer.find('.comment-area').val('');
                } else {
                    $comment = $(composeComment(resp));

                    $comment.prependTo(commentContainer);

                    $comment.find('.comment-delete').click(deleteCallback);

                    $comment.find('.comment-reply').click(replyCallback);
                }

                incrementOffset(getCommentsList.count);
            });
        },
        deleteComment = function ($deleteEL) {
            var deleteComment = config.deleteComment;

            $.ajax({
                url: composeURL(deleteComment.url, config.email, $deleteEL.data('id')),
                type: deleteComment.method
            }).done(function (resp) {
                $deleteEL.parents('.comment').remove();

                decrementOffset(1);
            });
        },
        editComment = function () {
            editComment = config.editComment;


            /*ajax(editComment.method, composeURL(editComment.url, config.email), function (resp) {
                console.log(resp);

            });*/
        },
        init = function () {
            $('.load-comments').click(function () {
                getCommentsList();
            });

            getCommentsList();
        };

    init();
});