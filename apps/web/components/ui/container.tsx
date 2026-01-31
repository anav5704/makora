interface ContainerProps {
  className?: String;
  children: React.ReactNode;
}

export const Container = ({ className, children }: ContainerProps ) => {
  return (
    <section className={`${className} w-3/5 mx-auto`}>
      {children}
    </section>
  )
}
