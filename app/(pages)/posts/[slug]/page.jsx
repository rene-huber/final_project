import { getServerSession } from "next-auth";
import { getCurrentUser } from '@/utils/session';


import { authOptions } from "@/utils/auth";
import prisma from "@/utils/prismaConnect";
import Image from "next/image";
import DeletePost from "@/components/deletePost/DeletePost";
import EditPost from "@/components/edit/Edit";
import Comments from "@/components/comments/Comments";
import Card from "@/components/card/Card";
import UserList from "@/components/users-list/UsersList";


const onePost = async ({ params, page, cat }) => {

  const userr = await getCurrentUser();
  const slug = params.slug;
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;



 
  
  const getData = async (page, cat) => {
    const res = await fetch(`http://localhost:3000/api/posts/${slug}`, {
      cache: "no-store",
    }, { next: { revalidate: 0 } });

    if (!res.ok) {
      throw new Error("Failed");
    }

    return res.json();
  };

  const data = await getData();



if(data?.post ){
  try {
    if (userEmail) {
      const viewExists = await prisma.postView.findUnique({
        where: {
          postSlug_userEmail: {
            postSlug: slug,
            userEmail: userEmail,
          },
        },
      });
    
      if (!viewExists) {
        await prisma.post.update({
          where: { slug},
          data: { views: { increment: 1 } },
        });
    
        await prisma.postView.create({
          data: {
            postSlug: slug,
            userEmail: userEmail,
          },
        });
      }
    }
    
  } catch (error) {
    console.error(err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong!" }, { status: 500 })
    );
  }
}

  





  return (
    <> 
    {/* <Card item={data?.post} key={data?.post?.title} /> */}
    

<UserList authorEmail={data?.post?.userEmail} />
    
     <p>views: {data?.post?.views}</p>
      <Image src={data?.post?.img} alt={data?.post?.title} width={300} height={300} />

      
      <p>Description: {data?.post?.desc}</p>
     
      
     

      {data?.post?.userEmail === userEmail && <DeletePost slug={slug} session={session} />}
      <Comments postSlug={slug} />

    </>
  );
};

export default onePost;
