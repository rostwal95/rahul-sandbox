export type TestimonialProps = {
  quote: string;
  author: string;
  role?: string;
  avatarUrl?: string;
};
export function Testimonial({
  quote,
  author,
  role,
  avatarUrl,
}: TestimonialProps) {
  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 text-center">
      <figure className="mx-auto max-w-3xl">
        <blockquote className="text-xl leading-relaxed text-zinc-800 [text-wrap:pretty]">
          “{quote}”
        </blockquote>
        <figcaption className="mt-6 flex items-center justify-center gap-3">
          {avatarUrl && (
            <img
              src={avatarUrl}
              className="h-10 w-10 rounded-full ring-1 ring-zinc-200"
              alt=""
              loading="lazy"
            />
          )}
          <div className="text-sm text-zinc-600">
            {author}
            {role ? `, ${role}` : ""}
          </div>
        </figcaption>
      </figure>
    </section>
  );
}
