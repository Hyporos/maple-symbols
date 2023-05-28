import "./Button.css";

interface Props {
  name: string;
  variant: string;
}

const Button = ({ name, variant }: Props) => {
  return (
    <button className={`bg-${variant} p-4 rounded text-text`}>
      {name}
    </button>
  );
};

export default Button;
