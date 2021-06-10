import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment } from "react";
import useHttp from "../../hooks/useHttp";

const authLinks = [
  { title: "Ticket", link: "/ticket/new" },
  { title: "Orders", link: "/order" },
];

const Layout = ({ children, user }) => {
  const { startHttp } = useHttp({ url: "/user/signout", method: "post" });
  const router = useRouter();
  const handleSignout = async () => {
    await startHttp();
    router.push("/");
  };

  return (
    <div>
      <nav className="navbar navbar-light bg-light">
        <Link href="/">
          <a className="navbar-brand">GitTix</a>
        </Link>
        <div className="d-flex justify-content-end">
          <ul className="nav d-flex align-items-center">
            {user ? (
              <Fragment>
                {authLinks.map((link) => (
                  <li className="nav-item" key={link.link}>
                    <Link href={link.link}>
                      <a className="nav-link">{link.title}</a>
                    </Link>
                  </li>
                ))}
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-secondary"
                    type="button"
                    onClick={handleSignout}
                  >
                    Sign out
                  </button>
                </li>
              </Fragment>
            ) : (
              <Fragment>
                <li className="nav-item">
                  <Link href="/account/signup">
                    <a className="nav-link">Sign up</a>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/account/signin">
                    <a className="nav-link">Sign in</a>
                  </Link>
                </li>
              </Fragment>
            )}
          </ul>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
