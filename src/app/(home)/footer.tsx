export const Footer = () => {
  return (
    <footer
      className="flex justify-between border-t p-6 font-medium"
      aria-label="Site footer"
    >
      <div className="flex items-center gap-2">
        <p>&copy; {new Date().getFullYear()} xSparkBazaar, Inc.</p>
      </div>
    </footer>
  );
};
