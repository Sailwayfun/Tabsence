interface HeadingProps {
  text: string;
}

const Heading = ({ text }: HeadingProps) => {
  return (
    <h2 className="text-xl font-bold tracking-widest text-white">{text}</h2>
  );
};

export default Heading;
