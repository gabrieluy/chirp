import { SignOutButton, useUser } from "@clerk/nextjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingPage } from "~/components/loading";
import { RouterOutputs, api } from "~/utils/api";
import { useState } from "react";
import { NextPage } from "next";
import Image from "next/image";
import Head from "next/head";
import dayjs from "dayjs";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number]
const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (          
    <div className="flex border-b border-slate-400 p-4 gap-3" key={post.id}>
      <Image className="rounded-full" width={50} height={50} src={author.profileImageUrl} alt="Profile Img"></Image>
      <div className="flex flex-col">
        <div className="flex text-slate-300 gap-1">
          <span>{`@${author.username}`}</span>
          <span>·</span>
          <span>{dayjs(post.createdAt).fromNow()}</span>
        </div>
        <span>{post.content}</span>
      </div>
    </div>
  )
};

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = useState("");
  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      ctx.posts.getAll.invalidate();
    }
  });
  
  if(!user) return null;
  return <div className="flex w-full gap-3">
    <Image className="rounded-full" width={56} height={56} src={user.imageUrl} alt="Profile Img"></Image>
    <input 
      placeholder="Type something"
      className="bg-transparent grow"
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      disabled={isPosting}
     />
     <button onClick={()=> mutate({content: input})}>Post</button>
    <SignOutButton />
  </div>;
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if(postsLoading) return <LoadingPage/>;
  
  if(!data) return <div> Its broken ... </div>;

  return(           
    <div>
      {data?.map((fullPost) =>
         <PostView {...fullPost} key={fullPost.post.id}/>
      )}
    </div>
  )
};

const Home: NextPage = () => {
  const { isSignedIn, isLoaded: userLoaded  } = useUser();

  api.posts.getAll.useQuery();


  if(!userLoaded) return <div/>;

  return (
    <div>
      <Head>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center h-screen">
        <div className="w-full h-full md:max-w-2xl border-slate-400 border-x">
        <div className="flex border-b border-slate-400 p-4">
            {!!isSignedIn && <CreatePostWizard/>}
        </div>
        <Feed></Feed>

        </div>
      </main>;
    </div>
  );
}

export default Home;
