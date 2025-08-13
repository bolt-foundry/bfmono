// RouterLink removed - using simple <a> tags instead
import { CfDsIcon } from "@bfmono/apps/cfDs/components/CfDsIcon.tsx";

type Crumb = {
  name: string;
  link: string;
  back?: boolean;
};

type BreadcrumbsProps = {
  crumbs: Array<Crumb>;
  homeLink?: string;
};
export function CfDsBreadcrumbs({ crumbs, homeLink }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumbs">
      <ul className="breadcrumbs">
        {homeLink && (
          <li className="breadcrumb-item">
            <a href={homeLink}>
              {<CfDsIcon name="home" size={16} />}
            </a>
          </li>
        )}
        {crumbs.map((crumb, index) => {
          return (
            <li className="breadcrumb-item" key={index}>
              <a href={crumb.link}>
                {crumb.back && <CfDsIcon name="arrowLeft" />}
                {crumb.name}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Example() {
  const crumbs = [
    { name: "A page", link: "/ui?page=a" },
    { name: "Another page", link: "/ui?page=b" },
    { name: "Yet another page", link: "/ui?page=c" },
  ];
  const homeLink = "/ui";
  return <CfDsBreadcrumbs crumbs={crumbs} homeLink={homeLink} />;
}
