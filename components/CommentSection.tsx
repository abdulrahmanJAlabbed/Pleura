import { db } from "@/configs/firebaseConfig";
import { icons } from "@/constants/icons";
import { useAuth } from "@/context/AuthContext";
import { Image } from "expo-image";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Avatar images mapping (same as profile screens)
const AVATAR_IMAGES: Record<string, any> = {
  avatar_1: require("@/assets/avatars/1.png"),
  avatar_2: require("@/assets/avatars/2.jpg"),
  avatar_3: require("@/assets/avatars/3.jpg"),
  avatar_4: require("@/assets/avatars/4.png"),
  avatar_5: require("@/assets/avatars/5.png"),
  avatar_6: require("@/assets/avatars/6.png"),
  avatar_7: require("@/assets/avatars/7.png"),
  avatar_8: require("@/assets/avatars/8.png"),
  avatar_9: require("@/assets/avatars/9.png"),
  avatar_10: require("@/assets/avatars/10.png"),
  avatar_11: require("@/assets/avatars/11.png"),
  avatar_12: require("@/assets/avatars/12.png"),
};

interface Comment {
  id: string;
  movieId: number;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  rating: number;
  createdAt: Timestamp;
  parentId: string | null;
}

interface CommentSectionProps {
  movieId: number;
}

// Time ago helper
const timeAgo = (timestamp: Timestamp | null): string => {
  if (!timestamp) return "just now";

  const now = new Date();
  const date = timestamp.toDate();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
  if (diffMonths > 0)
    return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  return "just now";
};

// Star Rating Component
const StarRating = ({
  rating,
  onRate,
  size = 20,
  editable = false,
}: {
  rating: number;
  onRate?: (rating: number) => void;
  size?: number;
  editable?: boolean;
}) => {
  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          disabled={!editable}
          onPress={() => onRate?.(star)}
        >
          <Image
            source={icons.star}
            style={{ width: size, height: size, marginRight: 2 }}
            tintColor={star <= rating ? "#FBBF24" : "#444"}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Single Comment Item
const CommentItem = ({
  comment,
  replies,
  onReply,
}: {
  comment: Comment;
  replies: Comment[];
  onReply: (parentId: string) => void;
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const avatarSource = AVATAR_IMAGES[comment.userAvatar] || null;

  return (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <View style={styles.avatarContainer}>
          {avatarSource ? (
            <Image
              source={avatarSource}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>
                {comment.userName?.[0]?.toUpperCase() || "U"}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.commentMeta}>
          <Text style={styles.userName}>{comment.userName}</Text>
          <Text style={styles.timeAgo}>{timeAgo(comment.createdAt)}</Text>
        </View>
        {comment.rating > 0 && <StarRating rating={comment.rating} size={14} />}
      </View>

      <Text style={styles.commentText}>{comment.text}</Text>

      <View style={styles.commentActions}>
        <TouchableOpacity
          style={styles.replyButton}
          onPress={() => onReply(comment.id)}
        >
          <Text style={styles.replyButtonText}>Reply</Text>
        </TouchableOpacity>

        {replies.length > 0 && (
          <TouchableOpacity
            style={styles.showRepliesButton}
            onPress={() => setShowReplies(!showReplies)}
          >
            <Text style={styles.showRepliesText}>
              {showReplies ? "Hide" : `View ${replies.length}`} replies
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Nested Replies */}
      {showReplies && replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {replies.map((reply) => (
            <View key={reply.id} style={styles.replyItem}>
              <View style={styles.commentHeader}>
                <View style={styles.avatarContainerSmall}>
                  {AVATAR_IMAGES[reply.userAvatar] ? (
                    <Image
                      source={AVATAR_IMAGES[reply.userAvatar]}
                      style={styles.avatarSmall}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.avatarFallbackSmall}>
                      <Text style={styles.avatarFallbackTextSmall}>
                        {reply.userName?.[0]?.toUpperCase() || "U"}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.commentMeta}>
                  <Text style={styles.userNameSmall}>{reply.userName}</Text>
                  <Text style={styles.timeAgoSmall}>
                    {timeAgo(reply.createdAt)}
                  </Text>
                </View>
              </View>
              <Text style={styles.commentTextSmall}>{reply.text}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// Main Comment Section
const CommentSection = ({ movieId }: CommentSectionProps) => {
  const { user, userData } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Only allow verified users (non-guests) to comment
  const isVerified = user && userData && !userData.isGuest;

  // Load comments
  useEffect(() => {
    const commentsRef = collection(db, "comments");
    const q = query(
      commentsRef,
      where("movieId", "==", movieId),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedComments: Comment[] = [];
      snapshot.forEach((doc) => {
        loadedComments.push({ id: doc.id, ...doc.data() } as Comment);
      });
      setComments(loadedComments);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [movieId]);

  // Submit comment
  const handleSubmit = async () => {
    if (!newComment.trim() || !user || !userData) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, "comments"), {
        movieId,
        userId: user.uid,
        userName: userData.name || "Anonymous",
        userAvatar: userData.avatar || "avatar_1",
        text: newComment.trim(),
        rating: replyingTo ? 0 : rating,
        createdAt: serverTimestamp(),
        parentId: replyingTo,
      });
      setNewComment("");
      setRating(0);
      setReplyingTo(null);
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (parentId: string) => {
    setReplyingTo(parentId);
    setRating(0);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setRating(0);
  };

  // Separate root comments and replies
  const rootComments = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) =>
    comments.filter((c) => c.parentId === parentId);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Comments</Text>

      {/* Comment Input */}
      {isVerified ? (
        <View style={styles.inputSection}>
          {replyingTo && (
            <View style={styles.replyingBanner}>
              <Text style={styles.replyingText}>Replying to comment...</Text>
              <TouchableOpacity onPress={cancelReply}>
                <Text style={styles.cancelReply}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {!replyingTo && (
            <View style={styles.ratingRow}>
              <Text style={styles.rateLabel}>Rate this movie:</Text>
              <StarRating
                rating={rating}
                onRate={setRating}
                editable
                size={24}
              />
            </View>
          )}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder={
                replyingTo ? "Write a reply..." : "Write a comment..."
              }
              placeholderTextColor="#666"
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                submitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={submitting || !newComment.trim()}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Image
                  source={icons.arrow}
                  style={styles.submitIcon}
                  tintColor="#fff"
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.verifyNotice}>
          <Text style={styles.verifyText}>
            Verify your phone number to leave comments and ratings.
          </Text>
        </View>
      )}

      {/* Comments List */}
      {loading ? (
        <ActivityIndicator size="large" color="#ab8bff" style={styles.loader} />
      ) : rootComments.length === 0 ? (
        <Text style={styles.noComments}>No comments yet. Be the first!</Text>
      ) : (
        <View style={styles.commentsList}>
          {rootComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={getReplies(comment.id)}
              onReply={handleReply}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingBottom: 20,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  inputSection: {
    backgroundColor: "rgba(26, 26, 46, 0.8)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  rateLabel: {
    color: "#A8B5C7",
    fontSize: 14,
    marginRight: 12,
  },
  starContainer: {
    flexDirection: "row",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    fontSize: 14,
    minHeight: 44,
    maxHeight: 100,
  },
  submitButton: {
    backgroundColor: "#ab8bff",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitIcon: {
    width: 18,
    height: 18,
    transform: [{ rotate: "0deg" }],
  },
  replyingBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  replyingText: {
    color: "#ab8bff",
    fontSize: 14,
  },
  cancelReply: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "600",
  },
  verifyNotice: {
    backgroundColor: "rgba(171, 139, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(171, 139, 255, 0.3)",
  },
  verifyText: {
    color: "#ab8bff",
    fontSize: 14,
    textAlign: "center",
  },
  loader: {
    marginTop: 40,
  },
  noComments: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
  },
  commentsList: {
    gap: 16,
  },
  commentItem: {
    backgroundColor: "rgba(26, 26, 46, 0.6)",
    borderRadius: 12,
    padding: 16,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  commentMeta: {
    flex: 1,
  },
  userName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  timeAgo: {
    color: "#666",
    fontSize: 12,
  },
  commentText: {
    color: "#A8B5C7",
    fontSize: 14,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: "row",
    marginTop: 12,
    gap: 16,
  },
  replyButton: {
    paddingVertical: 4,
  },
  replyButtonText: {
    color: "#ab8bff",
    fontSize: 13,
    fontWeight: "500",
  },
  showRepliesButton: {
    paddingVertical: 4,
  },
  showRepliesText: {
    color: "#666",
    fontSize: 13,
  },
  repliesContainer: {
    marginTop: 16,
    marginLeft: 20,
    borderLeftWidth: 2,
    borderLeftColor: "rgba(171, 139, 255, 0.3)",
    paddingLeft: 16,
    gap: 12,
  },
  replyItem: {
    backgroundColor: "rgba(17, 17, 17, 0.5)",
    borderRadius: 8,
    padding: 12,
  },
  avatarContainerSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: "hidden",
    marginRight: 10,
  },
  avatarSmall: {
    width: 28,
    height: 28,
  },
  avatarFallbackSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackTextSmall: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  userNameSmall: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  timeAgoSmall: {
    color: "#666",
    fontSize: 11,
  },
  commentTextSmall: {
    color: "#9CA4AB",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
});

export default CommentSection;
