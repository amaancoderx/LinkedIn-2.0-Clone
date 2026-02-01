// post.ts
import mongoose, { Schema, Document, models, Model } from "mongoose";
import { Comment, IComment, ICommentBase } from "./comment";
import { IUser } from "@/types/user";

export interface IPostBase {
  user: IUser;
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  imageUrls?: string[];
  videoUrls?: string[];
  comments?: IComment[];
  likes?: string[];
  isRepost?: boolean;
  originalPostId?: string;
  originalAuthor?: IUser;
  originalPost?: {
    _id: string;
    user: IUser;
    text: string;
    imageUrl?: string;
    videoUrl?: string;
    createdAt: Date;
  };
}

export interface IPost extends IPostBase, Document {
  createdAt: Date;
  updatedAt: Date;
}

// Define the document methods (for each instance of a post)
interface IPostMethods {
  likePost(userId: string): Promise<void>;
  unlikePost(userId: string): Promise<void>;
  commentOnPost(comment: ICommentBase): Promise<void>;
  getAllComments(): Promise<IComment[]>;
  removePost(): Promise<void>;
}

// Define the static methods
interface IPostStatics {
  getAllPosts(): Promise<IPostDocument[]>;
}

// Merge the document methods, and static methods with IPost
export interface IPostDocument extends IPost, IPostMethods {}
interface IPostModel extends IPostStatics, Model<IPostDocument> {}

const PostSchema = new Schema<IPostDocument>(
  {
    user: {
      userId: { type: String, required: true },
      userImage: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String },
    },
    text: { type: String, required: true },
    imageUrl: { type: String },
    videoUrl: { type: String },
    imageUrls: { type: [String], default: [] },
    videoUrls: { type: [String], default: [] },
    comments: { type: [Schema.Types.ObjectId], ref: "Comment", default: [] },
    likes: { type: [String], default: [] },
    isRepost: { type: Boolean, default: false },
    originalPostId: { type: String },
    originalAuthor: {
      userId: { type: String },
      userImage: { type: String },
      firstName: { type: String },
      lastName: { type: String },
    },
    originalPost: {
      _id: { type: String },
      user: {
        userId: { type: String },
        userImage: { type: String },
        firstName: { type: String },
        lastName: { type: String },
      },
      text: { type: String },
      imageUrl: { type: String },
      videoUrl: { type: String },
      createdAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

PostSchema.methods.likePost = async function (userId: string) {
  try {
    await this.updateOne({ $addToSet: { likes: userId } });
  } catch (error) {
    console.log("error when liking post", error);
  }
};

PostSchema.methods.unlikePost = async function (userId: string) {
  try {
    await this.updateOne({ $pull: { likes: userId } });
  } catch (error) {
    console.log("error when unliking post", error);
  }
};

PostSchema.methods.removePost = async function () {
  try {
    await this.model("Post").deleteOne({ _id: this._id });
  } catch (error) {
    console.log("error when removing post", error);
  }
};

PostSchema.methods.commentOnPost = async function (commentToAdd: ICommentBase) {
  try {
    const comment = await Comment.create(commentToAdd);
    this.comments.push(comment._id);
    await this.save();
  } catch (error) {
    console.log("error when commenting on post", error);
  }
};

PostSchema.statics.getAllPosts = async function () {
  try {
    const posts = await this.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "comments",

        options: { sort: { createdAt: -1 } },
      })
      .populate("likes")
      .lean(); // lean() returns a plain JS object instead of a mongoose document

    const mappedPosts = posts.map((post: IPostDocument) => {
      const mappedPost = {
        ...post,
        _id: post._id.toString(),
        comments: post.comments?.map((comment: IComment) => ({
          ...comment,
          _id: comment._id.toString(),
        })),
      };

      // Debug log for posts with multiple images
      if (mappedPost.imageUrls && mappedPost.imageUrls.length > 0) {
        console.log("Post with multiple images:", {
          postId: mappedPost._id,
          imageUrlsCount: mappedPost.imageUrls.length,
          imageUrls: mappedPost.imageUrls,
        });
      }

      return mappedPost;
    });

    return mappedPosts;
  } catch (error) {
    console.log("error when getting all posts", error);
  }
};

PostSchema.methods.getAllComments = async function () {
  try {
    await this.populate({
      path: "comments",

      options: { sort: { createdAt: -1 } },
    });
    return this.comments;
  } catch (error) {
    console.log("error when getting all comments", error);
  }
};

// Force model re-registration in development
if (models.Post) {
  delete models.Post;
}

export const Post = mongoose.model<IPostDocument, IPostModel>("Post", PostSchema);
