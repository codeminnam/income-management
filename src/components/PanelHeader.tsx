type PanelHeaderProps = {
  title: string;
  description: string;
};

const PanelHeader = ({ title, description }: PanelHeaderProps) => (
  <div className="panel-header">
    <h1>{title}</h1>
    {description ? <p className="description">{description}</p> : null}
  </div>
);

export default PanelHeader;
