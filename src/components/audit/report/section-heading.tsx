export function SectionHeading({ title, lead }: { title: string; lead?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center text-balance">
      <h2 className="block [font-family:LTRemark,_Georgia,_serif] text-4xl leading-10 max-md:text-2xl max-md:leading-8 md:max-lg:text-3xl md:max-lg:leading-9">
        {title}
      </h2>
      {lead ? <p className="mt-1.5 block text-muted-foreground">{lead}</p> : null}
    </div>
  );
}
