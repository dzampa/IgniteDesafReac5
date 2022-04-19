import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import Link from 'next/Link';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import React, { useState } from 'react';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  // TODO
  const postsFormatted = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: format(
        new Date(post.first_publication_date),
        "dd MMM yyyy",
        {
          locale: ptBR,
        }
      ),
    }
  });

  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [nextPageExists, setNextPageExists] = useState(1);
  const [posts, setPosts] = useState<Post[]>(postsFormatted);

  async function handleNextPage() {
    if (nextPageExists !== 1 && nextPage === null) {
      return;
    }
    const postResult = await fetch(`${nextPage}`).then(response => response.json());
    setNextPage(postResult.next_page);
    setNextPageExists(postResult.page);

    const loadNewPosts = postResult.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          "dd MMM yyyy",
          {
            locale: ptBR,
          }
        ),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        }
      }
    })

    setPosts([...posts, ...loadNewPosts]);
  }

  return (
    <div className={commonStyles.container}>
      <Header />
      {posts.map(post => (
        <Link key={post.uid} href={`/post/${post.uid}`}>
          <a className={styles.post}>
            <strong>{post.data.title}</strong>
            <p>{post.data.subtitle}</p>
            <div className={styles.containerSmall}>
              <time>{post.first_publication_date}</time>
              <small>{post.data.author}</small>
            </div>
          </a>
        </Link>
      ))}
      {postsPagination.next_page !== null && (
        <button className={styles.loadMore} onClick={handleNextPage}>Carregar mais posts</button>
      )}
    </div>
  )
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at("document.type", "posts",)],
    {
      pageSize: 1,
    }
  );
  // TODO
  const posts = postsResponse.results.map(posts => {
    return {
      uid: posts.uid,
      first_publication_date: posts.first_publication_date,
      data: {
        title: posts.data.title,
        subtitle: posts.data.subtitle,
        author: posts.data.author,
      }
    }
  })
  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  }

  return {
    props: {
      postsPagination,
    }
  }
};
